####################################################################
## 1 - Set environment and load libraries ======================================
# Clear workspace
rm(list = ls())

# Set working directory to source file location (comment out if not using RStudio)
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd("../")

# List of packages
packages <- c("terra", "sf", "cluster", "factoextra", "ggplot2", "dplyr", "RColorBrewer",
              "pheatmap", "patchwork", "knitr", "FactoMineR", "Rcpp", "GGally", 
              "car", "caret", "mapview")

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
## 8 - Export Results =======================================================
# Load PSU shapefile and join cluster information
psus <- st_read("data/results/all/all_psus_target.shp")
gpt <- read_csv("data/cluster_interpretation/Custer_analysis_from_ChatGPT.csv")
names(gpt)[1] <- "cluster"

su.cov.db.df_clean <- read_csv("data/cluster_interpretation/su.cov.db.df_clean.csv")

y <- psus %>%
  left_join(su.cov.db.df_clean[, 1:2], by = "PSU_ID") %>%
  left_join(gpt, by = "cluster")

# Write the result to a GeoPackage
st_write(y, "data/results/TargetPSU_clusters_ChatGPT.gpkg", delete_dsn = TRUE)

# plot the results

mapview(y, zcol = "Name")

# Load necessary libraries
library(dplyr)
library(cluster)

# Assuming `su.cov.db.df_clean` is your dataframe
# Calculate the mean values for each cluster
cluster_summary <- su.cov.db.df_clean %>%
  group_by(cluster) %>%
  summarise(across(where(is.numeric), mean))

# Convert the cluster summary to a matrix
cluster_matrix <- as.matrix(cluster_summary[,-1])  # Remove the first column (cluster) as it's a label

# Calculate the distance matrix
dist_matrix_cluster <- dist(cluster_matrix, method = "euclidean")

# Perform hierarchical clustering
hclust_result_cluster <- hclust(dist_matrix_cluster, method = "ward.D2")

# Plot the dendrogram
plot(hclust_result_cluster, main = "Dendrogram of Clusters", xlab = "Cluster", sub = "", ylab = "Height")


# Install if you haven't installed these yet
# install.packages("ggdendro")
# install.packages("ggplot2")

# Load the packages
library(ggdendro)
library(ggplot2)

# Assuming you already have 'hclust_result_cluster' from the previous step

# Convert the hclust object into a format that ggplot2 can use
dendro_data <- dendro_data(hclust_result_cluster)

# Plot the dendrogram with labels
g <- ggplot() +
  geom_segment(data = segment(dendro_data),
               aes(x = x, y = y, xend = xend, yend = yend)) +
  geom_text(data = label(dendro_data),
            aes(x = x, y = y, label = label),
            vjust = 1.5, hjust = 0.5, angle = 0, size = 3, color = "blue") +
  labs(title = "Dendrogram of Clusters with Labels",
       x = "Cluster",
       y = "Height") +
  # geom_hline(yintercept = 1500, linetype = "dashed", color = "red") +  # Example cut-off line
  theme_minimal() +
  scale_x_continuous(breaks = NULL)  # Elimina las etiquetas del eje x por defecto
g
ggsave(plot = g,filename =  "data/results/dendrograma.png")
