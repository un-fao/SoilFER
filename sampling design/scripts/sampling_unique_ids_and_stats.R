# Script to merge all shapefiles, to create unique id and basic stats

## 1 - Set environment and load libraries ======================================

# Set working directory to source file location
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd("../") # Move wd down to the main folder
getwd()

# List of packages
packages <- c("sp","terra","sf", "data.table", "ggplot2", "dplyr", "RColorBrewer")

# Load packages
invisible(lapply(packages, library, character.only = TRUE))
rm(packages)


# Define country ISO code
ISO.code <- "ZMB"

# Define EPSG system
epsg <- "EPSG:3857"

# Define folder location
folder <- "data/results/"

# Create folder location for all data
folder_all <- paste0(folder,"all/")

# check if folder_all directory exists if not create it
if (!file.exists(folder_all)){
  # create a new sub directory inside the main path
  dir.create(folder_all)
}

## 2 - Importing and merging shapefiles ========================================

country_boundaries <- sf::st_read(paste0(folder,"../shapes/ZMB_adm1.shp"), quiet=TRUE)

# Define the column with the country and province names
country_boundaries$country <- ISO.code
country_boundaries$province <- country_boundaries$NAME_1

if(crs(country_boundaries)!=epsg){
  country_boundaries <- country_boundaries %>%
    st_as_sf() %>% sf::st_transform(crs=epsg)
}

ncolors <- length(unique(country_boundaries$province))

# Importing - Target -----------------------------------------------------------#
# PSUs
psus_target_croplands <- sf::st_read(paste0(folder, "crops/PSUs_target.shp"), quiet = T)
psus_target_croplands$lulc <- "C"

psus_target_grasslands <- sf::st_read(paste0(folder, "grassland/PSUs_target.shp"), quiet = T)
psus_target_grasslands$lulc <- "G"

psus_target_forests <- sf::st_read(paste0(folder, "forests/PSUs_target.shp"), quiet = T)
psus_target_forests$lulc <- "F"

# TSUs
tsus_target_croplands <- sf::st_read(paste0(folder, "crops/TSUs_target.shp"), quiet = T)
tsus_target_croplands$lulc <- "C"

tsus_target_grasslands <- sf::st_read(paste0(folder, "grassland/TSUs_target.shp"), quiet = T)
tsus_target_grasslands$lulc <- "G"

tsus_target_forests <- sf::st_read(paste0(folder, "forests/TSUs_target.shp"), quiet = T)
tsus_target_forests$lulc <- "F"

# Merging - Target
# PSUs 
psus_target_list <- list(psus_target_croplands, psus_target_grasslands, psus_target_forests)
psus_target <- sf::st_as_sf(data.table::rbindlist(psus_target_list))

# TSUs 
tsus_target_list <- list(tsus_target_croplands, tsus_target_grasslands, tsus_target_forests)
tsus_target <- sf::st_as_sf(data.table::rbindlist(tsus_target_list))

# Importing - Replacement -------------------------------------------------------#
# PSUs
psus_repl_croplands <- sf::st_read(paste0(folder, "crops/PSUs_replacements.shp"), quiet = T)
psus_repl_croplands$lulc <- "C"

psus_repl_grasslands <- sf::st_read(paste0(folder, "grassland/PSUs_replacements.shp"), quiet = T)
psus_repl_grasslands$lulc <- "G"

psus_repl_forests <- sf::st_read(paste0(folder, "forests/PSUs_replacements.shp"), quiet = T)
psus_repl_forests$lulc <- "F"

# TSUs
tsus_repl_croplands <- sf::st_read(paste0(folder, "crops/TSUs_replacements.shp"), quiet = T)
tsus_repl_croplands$lulc <- "C"

tsus_repl_grasslands <- sf::st_read(paste0(folder, "grassland/TSUs_replacements.shp"), quiet = T)
tsus_repl_grasslands$lulc <- "G"

tsus_repl_forests <- sf::st_read(paste0(folder, "forests/TSUs_replacements.shp"), quiet = T)
tsus_repl_forests$lulc <- "F"

# Merging - Replacement
# PSUs 
psus_repl_list <- list(psus_repl_croplands, psus_repl_grasslands, psus_repl_forests)
psus_repl <- sf::st_as_sf(data.table::rbindlist(psus_repl_list))

# TSUs 
tsus_repl_list <- list(tsus_repl_croplands, tsus_repl_grasslands, tsus_repl_forests)
tsus_repl <- sf::st_as_sf(data.table::rbindlist(tsus_repl_list))


## 3 - Plotting target and replacement sites ===================================
ggplot() +
  geom_sf(data = psus_target, color = "#101010", fill = NA, lwd = 0.8) +
  geom_sf(data = tsus_target, aes(), color = "#D81B60", size = 0.5, shape = 19, lwd = 0.7) +
  labs(title = "Target Primary Sampling Units",
       x = "Longitude",
       y = "Latitude",
       fill = "PC1") +
  theme_minimal()

ggplot() +
  geom_sf(data = psus_repl, color = "#101010", fill = NA, lwd = 0.8) +
  geom_sf(data = tsus_repl, aes(), color = "#D81B60", size = 0.5, shape = 19, lwd = 0.7) +
  labs(title = "Alternative Primary Sampling Units",
       x = "Longitude",
       y = "Latitude",
       fill = "PC1") +
  theme_minimal()

## 4 - Assign unique sites id for the PSUs target and replacement ==============
# Target PSUs --------------------#
head(psus_target, 15)

## Create an unique ID based on PSU ID and LULC
psus_target$PSU_R_LULC_ID <- paste0(psus_target$Replace_ID, "-", psus_target$lulc)

## Now, create ID based on the number of total samples for the country
psus_target[[paste0(ISO.code,"_PSU_ID")]] = 1:nrow(psus_target)
psus_target <- psus_target %>%
  select(ID, Replace_ID, lulc, PSU_R_LULC_ID, all_of(paste0(ISO.code, "_PSU_ID")), everything())

# Replacement PSUs ----------------#
head(psus_repl, 15)
## Create an unique ID based on PSU ID and LULC
psus_repl$PSU_R_LULC_ID <- paste0(psus_repl$Replace_ID, "-", psus_repl$lulc)

## Now, create ID based on the number of total samples for the country
start_id <- nrow(psus_target) + 1 # Set where the next id has to start from.

psus_repl[[paste0(ISO.code,"_PSU_ID")]] = start_id:(start_id + nrow(psus_repl) - 1)

psus_repl <- psus_repl %>%
  select(ID, Replace_ID, lulc, PSU_R_LULC_ID, all_of(paste0(ISO.code, "_PSU_ID")), everything())

# Target and Replacements together  -----------------#
## Linking the PSUs replacement ids with the PSUs targets
head(psus_target)
head(psus_repl)
## Create a index matching the unique IDs ()
index <- match(psus_target$PSU_R_LULC_ID, psus_repl$PSU_R_LULC_ID)

## Retrieving new PSUs ID (i.e., ISO country code _PSU_ID)
psus_target[["PSU_R_ID"]] <- psus_repl[[paste0(ISO.code,"_PSU_ID")]][index]

#psus_target[is.na(psus_target$PSU_R_ID), ]

psus_target <- psus_target %>%
  select(ID, Replace_ID, lulc, PSU_R_LULC_ID, PSU_R_ID, all_of(paste0(ISO.code, "_PSU_ID")), everything())


## 5 - Assign unique sites id ==================================================
# Target -----------------------------------#
## Here creates unique ID for the PSUs and sites
psus_target$PSU_T_LULC_ID <- paste0(psus_target$ID, "-", psus_target$lulc)

psus_target <- psus_target %>%
  select(ID, Replace_ID, lulc, PSU_R_LULC_ID, PSU_T_LULC_ID, PSU_R_ID, all_of(paste0(ISO.code, "_PSU_ID")), everything())

## Here, creating the same unique ID for the TSUs
head(tsus_target, 10)
tsus_target$PSU_T_LULC_ID <- paste0(tsus_target$PSU_ID, "-", tsus_target$lulc)

## Create a index matching the unique IDs ()
index <- match(tsus_target$PSU_T_LULC_ID, psus_target$PSU_T_LULC_ID)

## Retrieving new PSUs ID (i.e., ISO country code _PSU_ID)
tsus_target[[paste0(ISO.code,"_PSU_ID")]] <- psus_target[[paste0(ISO.code,"_PSU_ID")]][index]

## Get the PSU replacements into the TSUs Target shapefile
tsus_target[["PSU_R_ID"]] <- psus_target[["PSU_R_ID"]][index] 

## Selecting only necessary fields
tsus_target <- tsus_target %>%
  select(all_of(paste0(ISO.code, "_PSU_ID")), PSU_Type, order, SSU_Type, TSU_ID, TSU_Type, site_id, lulc, PSU_R_ID)

## Changing the name of the PSU_ID, in my case the column is 3
names(tsus_target) <- gsub(paste0(ISO.code, "_PSU_ID"), "PSU_ID", names(tsus_target))
names(tsus_target) <- gsub("order", "SSU_ID", names(tsus_target))

## Finally, creating unique TSUs ID. This ID is the most important one.
tsus_target$site_id = paste0(ISO.code, sprintf("%04d", tsus_target$PSU_ID), "-", tsus_target$SSU_ID, "-", tsus_target$TSU_ID, tsus_target$lulc) 

# Replacement -------------------------------#
head(psus_repl)

## Here creates unique ID for the PSUs and sites
psus_repl$PSU_T_LULC_ID <- paste0(psus_repl$ID, "-", psus_repl$lulc)

psus_repl <- psus_repl %>%
  select(ID, Replace_ID, lulc, PSU_R_LULC_ID, PSU_T_LULC_ID, all_of(paste0(ISO.code, "_PSU_ID")), everything())

## Here, creating the same unique ID for the TSUs
head(tsus_repl, 10)
tsus_repl$PSU_T_LULC_ID <- paste0(tsus_repl$PSU_ID, "-", tsus_repl$lulc)

## Create a index matching the unique IDs ()
index <- match(tsus_repl$PSU_T_LULC_ID, psus_repl$PSU_T_LULC_ID)

## Retrieving new PSUs ID (i.e., ISO country code _PSU_ID)
tsus_repl[[paste0(ISO.code,"_PSU_ID")]] <- psus_repl[[paste0(ISO.code,"_PSU_ID")]][index]

## Get the PSU target into the TSUs Replacement shapefile
tsus_repl[["PSU_T_ID"]] <- psus_target[[paste0(ISO.code, "_PSU_ID")]][match(tsus_repl[[paste0(ISO.code,"_PSU_ID")]], psus_target$PSU_R_ID)]

## Selecting only necessary fields
tsus_repl <- tsus_repl %>%
  select(all_of(paste0(ISO.code, "_PSU_ID")), PSU_Type, order, SSU_Type, TSU_ID, TSU_Type, site_id, lulc, PSU_T_ID)

## Changing the name of the PSU_ID, in my case the column is 3
names(tsus_repl) <- gsub(paste0(ISO.code, "_PSU_ID"), "PSU_ID", names(tsus_repl))
names(tsus_repl) <- gsub("order", "SSU_ID", names(tsus_repl))

## Finally, creating unique TSUs ID. This ID is the most important one.
tsus_repl$site_id = paste0(ISO.code, sprintf("%04d", tsus_repl$PSU_ID), "-", tsus_repl$SSU_ID, "-", tsus_repl$TSU_ID, tsus_repl$lulc)


## 6 - Exporting shapefiles ========================================================
### Selecting fields, renaming and exporting
# PSU - Target
psus_target <- psus_target %>%
  select(all_of(paste0(ISO.code, "_PSU_ID")), PSU_R_ID, lulc)

names(psus_target) <- gsub(paste0(ISO.code, "_PSU_ID"), "PSU_ID", names(psus_target))
names(psus_target) <- gsub("PSU_R_ID", "Replace_ID", names(psus_target))

sf::write_sf(psus_target, paste0(folder_all, "all_psus_target.shp"), overwrite = T)

# PSU - Replacement
psus_repl <- psus_repl %>%
  select(all_of(paste0(ISO.code, "_PSU_ID")), lulc)

names(psus_repl) <- gsub(paste0(ISO.code, "_PSU_ID"), "Replace_ID", names(psus_repl))

sf::write_sf(psus_repl, paste0(folder_all, "all_psus_replacements.shp"), overwrite = T)

# TSU - Target
names(tsus_target) <- gsub("PSU_R_ID", "Replace_ID", names(tsus_target))

sf::write_sf(tsus_target, paste0(folder_all, "all_tsus_target.shp"), overwrite = T)

# TSU - Replacement
names(tsus_repl) <- gsub("PSU_T_ID", "PSU_Target_ID", names(tsus_repl))

sf::write_sf(tsus_repl, paste0(folder_all, "all_tsus_replacements.shp"), overwrite = T)

## 7 - Stats and graphs for country ========================================================

# Target sites only
tsus_uniq_sites <- dplyr::filter(tsus_target, SSU_Type == "Target" & TSU_Type == "Target")
head(tsus_uniq_sites)  
tsus_uniq_sites <- sf::st_join(tsus_uniq_sites, country_boundaries)
tsus_uniq_sites <- tsus_uniq_sites %>% 
  select(c(site_id, country, province, lulc, geometry))

# Converting shapefile to DF
tsus_uniq_sites_df <- as.data.frame(tsus_uniq_sites)
sites_distribution <- tsus_uniq_sites_df %>%
  group_by(country, lulc) %>%
  summarise(Sites = n())

# Graphs
custom_colors <- colorRampPalette(brewer.pal(11, "BrBG"))(ncolors)

jpeg(paste0(folder,"/final_site_distribution.jpeg"), width = 16, height = 12, units = 'in', res = 300)
ggplot(sites_distribution, aes(x = lulc, y = Sites, fill = lulc)) +
  geom_bar(stat = "identity", position = "dodge", width = 0.7) +  
  geom_text(aes(label = Sites),  
            position = position_dodge(width = 0.7), 
            vjust = -0.5, size = 3) +  
  labs(
    title = "Site Distribution",
    x = "LULC",
    y = "Number of Sites",
    fill = "LULC"
  ) +
  scale_x_discrete(labels = c("C" = "Cropland", "F" = "Forest", "G" = "Grassland")) +  # Rename x-axis labels
  scale_fill_manual(values = custom_colors, labels = c("C" = "Cropland", "F" = "Forest", "G" = "Grassland")) +  # Custom color palette
  ylim(0, max(sites_distribution$Sites) * 1.2) +  
  theme_minimal() +  
  theme(
    plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),  
    axis.text.x = element_text(angle = 0, hjust = 0.5, size = 14),  
    axis.text.y = element_text(size = 14),  
    axis.title.x = element_text(size = 14, face = "bold"),  
    axis.title.y = element_text(size = 14, face = "bold"),  
    legend.position = "top",  
    legend.title = element_text(size = 12, face = "bold"),  
    legend.text = element_text(size = 12),  
    panel.grid.major = element_line(color = "grey80", linetype = "dotted"),  
    panel.grid.minor = element_blank()  
  )
dev.off()

## 8 - Stats and graphs for provinces ========================================================
# Target sites only
# Converting shapefile to DF
tsus_uniq_sites_df <- as.data.frame(tsus_uniq_sites)
sites_distribution <- tsus_uniq_sites_df %>%
  group_by(province, lulc) %>%
  summarise(Sites = n())

# Graphs
custom_colors <- colorRampPalette(brewer.pal(11, "Spectral"))(ncolors)

jpeg(paste0(folder,"/final_site_distribution_province.jpeg"), width = 16, height = 12, units = 'in', res = 300)
ggplot(sites_distribution, aes(x = lulc, y = Sites, fill = province)) +
  geom_bar(stat = "identity", position = "dodge", width = 0.7) +  
  geom_text(aes(label = Sites),  
            position = position_dodge(width = 0.7), 
            vjust = -0.5, size = 3) +  
  labs(
    title = "Site Distribution",
    x = "LULC",
    y = "Number of Sites",
    fill = "Province"
  ) +
  scale_x_discrete(labels = c("C" = "Cropland", "F" = "Forest", "G" = "Grassland")) +  # Rename x-axis labels
  scale_fill_manual(values = custom_colors) +  # Custom color palette
  ylim(0, max(sites_distribution$Sites) * 1.2) +  
  theme_minimal() +  
  theme(
    plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),  
    axis.text.x = element_text(angle = 0, hjust = 0.5, size = 14),  
    axis.text.y = element_text(size = 14),  
    axis.title.x = element_text(size = 14, face = "bold"),  
    axis.title.y = element_text(size = 14, face = "bold"),  
    legend.position = "top",  
    legend.title = element_text(size = 12, face = "bold"),  
    legend.text = element_text(size = 12),  
    panel.grid.major = element_line(color = "grey80", linetype = "dotted"),  
    panel.grid.minor = element_blank()  
  )
dev.off()

