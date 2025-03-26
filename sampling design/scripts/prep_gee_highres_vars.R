# Preparing the dataset retrieved from Google Earth Engine


## 1 - Set environment and load libraries ===========================

# Set working directory to source file location
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd("../") # Move wd down to the main folder
getwd()
# Install synoptReg package from github
#install.packages("remotes") # Install remotes if not installed
#remotes::install_github("lemuscanovas/synoptReg")

# List of packages
packages <- c("sp","terra","raster","sf", "sgsR","entropy", "tripack","tibble",
              "manipulate","dplyr","synoptReg", "doSNOW","Rfast","fields", 
              "ggplot2", "rassta", "snowfall")

# Load packages
invisible(lapply(packages, library, character.only = TRUE))
rm(packages)

## 2 - Define variables and functions ===========================

# Define Country ISO code
ISO.code <- "ZMB" 

# Path to data folders
raster.path <- "data/rasters/hres_data"

## 3 - Load the high-resolution remote sensing data ============================

# TERRAIN (30 m)
## Digital Elevation Model 
dem <- terra::rast(paste0(raster.path, "/Terrain_Exports/SRTM_", ISO.code, ".tif"))

## Slope in degrees
slope <- terra::rast(paste0(raster.path, "/Terrain_Exports/Slope_", ISO.code, ".tif"))

## Aspect in degrees
aspect <- terra::rast(paste0(raster.path, "/Terrain_Exports/Aspect_", ISO.code, ".tif"))

## Hillshade
hillshade <- terra::rast(paste0(raster.path, "/Terrain_Exports/Hillshade_", ISO.code, ".tif"))

## TPI in metres ranging from - 100 to + 100. 
tpi <- terra::rast(paste0(raster.path, "/Terrain_Exports/TPI_", ISO.code, ".tif"))

## Geomorphon (Original 90m / Exported 30 m)
geomorph <- terra::rast(paste0(raster.path, "/Terrain_Exports/Geomorphon_", ISO.code, ".tif"))

# Sentinel (10 and 20 m)
## Spectral bands (10 m)
sen_b2 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B2_Median_", ISO.code, ".tif"))
sen_b3 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B3_Median_", ISO.code, ".tif"))
sen_b4 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B4_Median_", ISO.code, ".tif"))
sen_b5 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B5_Median_", ISO.code, ".tif"))
sen_b6 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B6_Median_", ISO.code, ".tif"))
sen_b7 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B7_Median_", ISO.code, ".tif"))
sen_b8 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B8_Median_", ISO.code, ".tif"))
sen_b8a <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B8a_Median_", ISO.code, ".tif"))
sen_b11 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B11_Median_", ISO.code, ".tif"))
sen_b12 <- terra::rast(paste0(raster.path, "/Sentinel_Exports/B12_Median_", ISO.code, ".tif"))

## Enhanced Vegetation Index (EVI; 20 m)
evi <- terra::rast(paste0(raster.path, "/Sentinel_Exports/EVI_", ISO.code, ".tif"))

## Normalised Difference Vegetation Index (NDVI; 20 m)
ndvi <- terra::rast(paste0(raster.path, "/Sentinel_Exports/NDVI_", ISO.code, ".tif"))

## Brightness Index (20 m)
brightness <- terra::rast(paste0(raster.path, "/Sentinel_Exports/Brightness_Index_", ISO.code, ".tif"))

## Normalised Burn Ratio + (20 m)
nbrplus <- terra::rast(paste0(raster.path, "/Sentinel_Exports/NBRPlus_", ISO.code, ".tif"))

## Normalised Difference Bare Soil Index (20 m)
ndbsi <- terra::rast(paste0(raster.path, "/Sentinel_Exports/NDBSI_", ISO.code, ".tif"))

## Redness Index (20 m)
redness <- terra::rast(paste0(raster.path, "/Sentinel_Exports/Redness_Index_", ISO.code, ".tif"))

## Vis-NIR-SWIR spectral index (20 m)
vnswir <- terra::rast(paste0(raster.path, "/Sentinel_Exports/VNSWIR_", ISO.code, ".tif"))

## Sentinel Synthetic Soil Image (SYSI)
### Load all files
sysisen <- list.files(paste0(raster.path, "/Sentinel_Exports/"), pattern = "^SYSIsen_ZMB.*\\.tif$", full.names = TRUE)
sysisen <- lapply(sysisen, rast)
sysisen <- do.call(merge, sysisen) 
names(sysisen) <- paste0("sysisen_", names(sysisen))

## 4 - Resampling rasters to 1 ha (100 m x 100 m) =============================== 
### Firstly, select one of the rasters that can be easily resampled to 1 ha

# Sentinel
sen_b2 <- aggregate(sen_b2, 10, fun=median, cores=8, na.rm=T) # (10 x 10) = 100 m res. or (20 x 5) = 100 m
sen_b3 <- terra::resample(sen_b3, sen_b2, method = "bilinear")
sen_b4 <- terra::resample(sen_b4, sen_b2, method = "bilinear")
sen_b5 <- terra::resample(sen_b5, sen_b2, method = "bilinear")
sen_b6 <- terra::resample(sen_b6, sen_b2, method = "bilinear")
sen_b7 <- terra::resample(sen_b7, sen_b2, method = "bilinear")
sen_b8 <- terra::resample(sen_b8, sen_b2, method = "bilinear")
sen_b8a <- terra::resample(sen_b8a, sen_b2, method = "bilinear")
sen_b11 <- terra::resample(sen_b11, sen_b2, method = "bilinear")
sen_b12 <- terra::resample(sen_b12, sen_b2, method = "bilinear")

evi <- terra::resample(evi, sen_b2, method = "bilinear")
ndvi <- terra::resample(ndvi, sen_b2, method = "bilinear")
brightness <- terra::resample(brightness, sen_b2, method = "bilinear")
nbrplus <- terra::resample(nbrplus, sen_b2, method = "bilinear")
ndbsi <- terra::resample(ndbsi, sen_b2, method = "bilinear")
redness <- terra::resample(redness, sen_b2, method = "bilinear")
vnswir <- terra::resample(vnswir, sen_b2, method = "bilinear")
sysisen <- terra::resample(sysisen, sen_b2, method = "bilinear") 

# Terrain
dem <- terra::resample(dem, sen_b2, method = "bilinear")
names(dem) <- "dem"
slope <- terra::resample(slope, sen_b2, method = "bilinear")
aspect <- terra::resample(aspect, sen_b2, method = "bilinear")
hillshade <- terra::resample(hillshade, sen_b2, method = "bilinear")
tpi <- terra::resample(tpi, sen_b2, method = "bilinear")
names(tpi) <- "tpi"
geomorph <- terra::resample(geomorph, sen_b2, method = "near")
names(geomorph) <- "geomorph"
geomorph <- rassta::dummies(ca.rast = geomorph$geomorph, preval = 1, absval = 0)


## 5 - Creating a stack of variables and exporting it ======================================== 

# Sentinel variables
sentinel_vars <- c(sen_b2, sen_b3, sen_b4, sen_b5, sen_b6, sen_b7, sen_b8, sen_b8a, sen_b11, sen_b12, evi, ndvi, brightness, nbrplus, ndbsi, redness, vnswir, sysisen)

# Terrain variables
terrain_vars <- c(dem, slope, aspect, hillshade, tpi, geomorph)

# Combining both
covs_stack_ssu <- c(sentinel_vars, terrain_vars)
print(covs_stack_ssu)
names(covs_stack_ssu)

# Saving/exporting the results
writeRaster(covs_stack_ssu, paste0(raster.path, "/covs_stack_ssu_1ha_", ISO.code, ".tif"), overwrite = TRUE)
