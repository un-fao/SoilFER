####################################################################
## 1 - Set environment and load libraries ======================================
# Clear workspace
rm(list = ls())

# Set working directory to source file location (comment out if not using RStudio)
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd("../")

# List of packages
packages <- c("terra", "sf", "cluster", "factoextra", "ggplot2", "dplyr", "RColorBrewer",
              "pheatmap", "patchwork", "knitr", "FactoMineR", "Rcpp", "GGally", "car", "caret")

# Install and load packages
invisible(lapply(packages, function(pkg) {
  if (!require(pkg, character.only = TRUE)) {
    install.packages(pkg, dependencies = TRUE)
    library(pkg, character.only = TRUE)
  }
}))

# Define constants
ISO.code <- "ZMB"  # Country ISO code
epsg <- "EPSG:3857"  # EPSG code
raster.path <- "data/rasters/"  # Raster data path
shape.path <- "data/shapes/"  # Raster data path
folder <- "data/results/"  # Results folder path

# Define utility functions
## Function to calculate the mode (most frequent value)
get_mode <- function(x) {
  x <- na.omit(x)  # Remove NA values
  if (length(x) == 0) return(NA)  # Return NA if no valid values exist
  uniq_x <- unique(x)
  uniq_x[which.max(tabulate(match(x, uniq_x)))]  # Return the mode
}

####################################################################
## 2 - Uploading the PSU clusters for each land-use =============================
# Load raster data and mask with PSU shapefile
cov.dat <- rast(file.path(raster.path, "/covs_zam_clipped.tif"))
psus <- st_read("data/results/all/all_psus_target.shp")
covs <- mask(cov.dat, psus)

# plot(cov.dat)
# Create a random sample of points within the raster extent
set.seed(123)  # For reproducibility
dat <- spatSample(covs, size = 30000, method = "random", replace = FALSE, as.points = FALSE, na.rm = TRUE)
dat <- as_tibble(covs)

# Correlation analysis
GGally::ggcorr(dat)

####################################################################
## 3 - Data Cleaning and Preparation ===========================================
# Identify and remove linearly dependent variables
lin_combo <- findLinearCombos(dat)
if (!is.null(lin_combo$remove)) {
  dat <- dat[, -lin_combo$remove]
}

# Create a dummy response variable for analysis
dat$dummy_response <- rnorm(nrow(dat))

# Fit a linear model and remove aliased coefficients
modelo <- lm(dummy_response ~ ., data = dat)
alias_info <- alias(modelo)$Complete
if (!is.null(alias_info)) {
  dat <- dat[, !(names(dat) %in% rownames(alias_info))]
}

# Calculate VIF and remove variables with high multicollinearity
vif_resultados <- vif(modelo)
vif_threshold <- 9
variables_bajas_vif <- names(vif_resultados)[vif_resultados <= vif_threshold]
dat <- dat[, c(variables_bajas_vif, "dummy_response")]

# statistically significant variables + other variables of interest
vars <- c(variables_bajas_vif, "bio13", "bio14", "ndvi_060708_250m_mean", "ndvi_091011_250m_mean", "dtm_elevation_250m")

####################################################################
## 4 - Extracting Summary Statistics ============================================
# Extract median values for selected variables
su.cov.db.me <- terra::extract(cov.dat[[vars]], psus, fun = median, na.rm = TRUE, ID = FALSE)

# summary of variables for ChatGPT
summary(su.cov.db.me)
# names(su.cov.db.me) <- paste0("me_", names(su.cov.db.me))

# Combine extracted data with PSU IDs
su.cov.db <- cbind(psus["PSU_ID"], su.cov.db.me)
row.names(su.cov.db) <- su.cov.db$PSU_ID

####################################################################
## 5 - Preparing the Dataset ================================================
# Remove zero variance columns and NAs from the dataset
su.cov.db.df <- su.cov.db %>%
  st_drop_geometry() %>%
  na.omit()

# Identify and remove near-zero variance variables
nzv_info <- nearZeroVar(su.cov.db.df, saveMetrics = TRUE)
variables_a_eliminar <- rownames(nzv_info[nzv_info$zeroVar == TRUE | nzv_info$nzv == TRUE, ])
su.cov.db.df_clean <- su.cov.db.df[, !(names(su.cov.db.df) %in% variables_a_eliminar)]

# Scale numeric variables
numeric_vars <- sapply(su.cov.db.df_clean, is.numeric)
su.db.scaled <- scale(su.cov.db.df_clean[, numeric_vars], center = TRUE, scale = TRUE)

# Remove columns with NA or NaN after scaling
cols_with_na_nan <- colnames(su.db.scaled)[colSums(is.na(su.db.scaled) | is.nan(su.db.scaled)) > 0]
su.db.scaled <- su.db.scaled[, !(colnames(su.db.scaled) %in% cols_with_na_nan)]
su.cov.db.df_clean <- su.cov.db.df_clean[, !(names(su.cov.db.df_clean) %in% cols_with_na_nan)]

####################################################################
## 6 - Hierarchical Clustering ===============================================
# Calculate distance matrix and perform hierarchical clustering
dist_matrix <- dist(su.db.scaled)
hclust_result <- hclust(dist_matrix, method = "ward.D2")
clusters <- cutree(hclust_result, k = 3) # IMPORTANT: k defines the number of clusters

# Add cluster information to the cleaned data frame
su.cov.db.df_clean$cluster <- clusters
su.cov.db.df_clean <- su.cov.db.df_clean %>%
  dplyr::select(cluster, everything())

write_csv(su.cov.db.df_clean, "data/cluster_interpretation/su.cov.db.df_clean.csv")

####################################################################
## 7 - Summary Statistics by Cluster ==========================================
# Calculate mean and standard deviation for each cluster
test <- su.cov.db.df_clean %>%
  group_by(cluster) %>%
  summarise(across(everything(), list(mean = mean, sd = sd), na.rm = TRUE))
test[-1] <- round(test[-1], 3)
test <- test[,-2:-3]

# Save summary statistics to CSV
write_csv(test, "data/cluster_interpretation/cluster_summary_for_ChatGPT.csv")

