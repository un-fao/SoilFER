# Script to generate soil-climate environmental covariates

## 0 - Set environment and load libraries ===========================

# Set working directory to source file location
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd("../") # Move wd down to the main folder
getwd()

# List of packages
packages <- c("sp","terra","sf","jNSMR","dplyr")

# Load packages
invisible(lapply(packages, library, character.only = TRUE))
rm(packages)

## 1 - User-defined variables ==================================================

# Path to rasters
raster.path <- "data/rasters/"
# Path to shapes
shp.path <- "data/shapes/"
# Path to results
results.path <- "data/results/"

# EPSG system
epsg <- "EPSG:3857"

# Aggregation factor for up-scaling raster covariates (optional)
agg.factor = 1 # No aggregation


## 2 - Import and prepare data ====================================================
# Load country shape 
country_boundaries <- sf::st_read(file.path(paste0(shp.path,"roi_epsg_3857.shp")),quiet=TRUE)

if(crs(country_boundaries)!=epsg){
  country_boundaries <- country_boundaries %>%
    st_as_sf() %>% sf::st_transform(crs=epsg)
}

## Load raster covariate data
# Read Spatial data covariates as rasters with terra
# Read elev - Covs have a digital elevation model
elev <-  list.files(paste0(raster.path), pattern = "covs_zam_clipped.tif$",  recursive = TRUE, full.names = TRUE)
elev <- terra::rast(elev) # SpatRaster from terra
elev <- elev$dtm_elevation_250m

# Read awc from 0-100 cm from data calculated from Hengl and Gupta
# Downloaded from https://zenodo.org/records/2629149
## Downloaded here: https://stac.openlandmap.org/watercontent.33kPa_usda.4b1c/collection.json

# Calculate raster of mean awc with the extention of elev
awc <- terra::rast(paste0(raster.path, "awc0_100_epsg_4326.tif"))

if(crs(awc)!=epsg){
  awc <- terra::project(awc, epsg, method="near") 
}

awc <- resample(awc, elev)

# Read climate
## This initial info MUST be generated using the GEE code: 
newhall <- terra::rast(paste0(raster.path, "climate_vars.tif")) # SpatRaster from terra
names(newhall)

if(crs(newhall)!=epsg){
  newhall <- terra::project(newhall, epsg, method="near") 
}

# Resample to match extent
newhall <- resample(newhall, elev)

# Calculate lat and long
newhall$lonDD <- init(newhall[[1]], 'x')
newhall$latDD <- init(newhall[[1]], 'y')
#writeRaster(cov.dat$lonDD , paste0(raster.path, "lonDD.tif"), overwrite=TRUE)
#writeRaster(cov.dat$latDD , paste0(raster.path, "latDD.tif"), overwrite=TRUE)
newhall <- mask(newhall, elev) 
newhall$awc <- awc
newhall$elev <- elev

plot(newhall["tJan"]);plot(newhall["tFeb"]);
plot(newhall["pJan"]);plot(newhall["pDec"]);
summary(newhall)

# Crop covariates on administrative boundary
#newhall <- crop(newhall, country_boundaries, mask=TRUE, overwrite=TRUE)
#newhall <- crop(newhall, country, mask=TRUE, overwrite=TRUE)

# Save newhall input data
terra::writeRaster(newhall,paste0(results.path,"climate_vars.tif"), overwrite=TRUE)

# Clean memory
rm(elev)
rm(awc)
gc()

## 3 - Compute Newhall model ====================================================
# Compute Newhall model
#newhall <- aggregate(newhall, fact=agg.factor)
#newhall <- terra::rast(paste0(results.path,"climate.tif"))

system.time({ y <- newhall_batch(newhall,cores = 4) }) ## full resolution
mask <- y$annualRainfall-y$annualRainfall+1


## 4 - Plot Newhall model output ====================================================
# Plot results
terra::plot(y$annualWaterBalance, #range = c(-1000, 4000),
            cex.main = 0.9, main = "Annual Water Balance (P-PET)")

terra::plot(y$summerWaterBalance, #range = c(-1000, 2000),
            cex.main = 0.9, main = "Summer Water Balance")

terra::plot(y$temperatureRegime, main = "Temperature Regime")

terra::plot(y$moistureRegime, main = "Moisture Regime")

terra::plot(y$numCumulativeDaysDry, col = grDevices::terrain.colors(20),
            cex.main = 0.75, main = "# Cumulative Days Dry")

terra::plot(y$numCumulativeDaysDryOver5C, col = grDevices::terrain.colors(20),
            cex.main = 0.75, main = "# Cumulative Days Dry over 5 degrees C")

terra::plot(y$numConsecutiveDaysMoistInSomePartsOver8C, col = rev(grDevices::terrain.colors(20)),
            cex.main = 0.75, main = "# Consecutive Days Moist\nin some parts over 8 degrees C")

terra::plot(y$dryDaysAfterSummerSolstice, col = grDevices::terrain.colors(20),
            cex.main = 0.75, main = "# Dry Days After Summer Solstice")

terra::plot(y$moistDaysAfterWinterSolstice,col = rev(grDevices::terrain.colors(50)),
            cex.main = 0.75, main = "# Moist Days After Winter Solstice")

terra::plot(results$regimeSubdivision1,
            cex.main = 0.75, main = "# Regimen subdivisions 1")

terra::plot(results$regimeSubdivision2,
            cex.main = 0.75, main = "# Regimen subdivisions 2")

## 5 - Export Newhall model output ====================================================
# Exporting newhall
results <- mask(y,mask)

terra::writeRaster(results, paste0(results.path,"newhall.tif"), overwrite=TRUE)

#rm(mask)
#rm(y)


# Save newhall input data as integer x 10
results2 <- newhall
results2 <- app(newhall, function(x) { as.integer(x * 10) })
names(results2) <- names(newhall)
terra::writeRaster(results2,paste0(results.path,"climate_intx10.tif"), overwrite=TRUE)


# Save newhall results as integer x 10
results2 <- results
results2 <- app(results2, function(x) { as.integer(x * 10) })
names(results2) <- names(results)
terra::writeRaster(results2,paste0(results.path,"newhall_intx10.tif"), overwrite=TRUE)

rm(results2)
rm(newhall)

