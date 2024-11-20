# Script to create a sampling design

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
                  "ggplot2", "rassta")
  
  # Load packages
    invisible(lapply(packages, library, character.only = TRUE))
    rm(packages)

## 2 - Define variables and functions ===========================

  # Define Country ISO code
    ISO.code <- "ZMB" 
  
  # Define type of landuse
    landuse <- "crops"
    
  # Path to data folders
    raster.path <- "data/rasters/"
    shp.path <- "data/shapes/"
    other.path <- "data/other/"
    landuse_dir <- paste0("data/results/", landuse, "/")
    
    # check if landuse directory exists if not create it
    if (!file.exists(landuse_dir)){
      # create a new sub directory inside the main path
      dir.create(landuse_dir)
    }
    results.path <- landuse_dir
  
  # Define EPSG system
   epsg <- "EPSG:3857"
  
  # Define the total number of analyzed sites
   nsamples <- 300
   share <- 0.70
   nsamples <- nsamples * share
  
  # Define the number of PSUs to sample
    n.psu <- round(nsamples/8)
  
  # Define PSU and SSUs sizes 
    psu_size <- 2000  # (default = 2km x 2 km)
    ssu_size <- 100 # (default = 100m x 100m = 1 ha)
  
  # Define number of target and alternative SSUs at each PSU
    num_primary_ssus <- 4
    num_alternative_ssus <- 3
    
  # Define number of TSUs at each SSU
    number_TSUs <- 3
  
  # Define the number of iterations in the clustering process
    iterations <- 10
    
  # Define the minimum crop percent in selected PSUs
    percent_crop <- 10
    
  ### FUNCTIONS ###
  # Define Covariate Space Coverage function #
    # Clustering CSC function with fixed legacy data
    CSIS <- function(fixed, nsup, nstarts, mygrd) {
      n_fix <- nrow(fixed)
      p <- ncol(mygrd)
      units <- fixed$units
      mygrd_minfx <- mygrd[-units, ]
      MSSSD_cur <- NA
      for (s in 1:nstarts) {
        units <- sample(nrow(mygrd_minfx), nsup)
        centers_sup <- mygrd_minfx[units, ]
        centers <- rbind(fixed[, names(mygrd)], centers_sup)
        repeat {
          D <- rdist(x1 = centers, x2 = mygrd)
          cluster <- apply(X = D, MARGIN = 2, FUN = which.min) %>% as.factor(.)
          centers_cur <- centers
          for (i in 1:p) {
            centers[, i] <- tapply(mygrd[, i], INDEX = cluster, FUN = mean)
          }
          #restore fixed centers
          centers[1:n_fix, ] <- centers_cur[1:n_fix, ]
          #check convergence
          sumd <- diag(rdist(x1 = centers, x2 = centers_cur)) %>% sum(.)
          if (sumd < 1E-12) {
            D <- rdist(x1 = centers, x2 = mygrd)
            Dmin <- apply(X = D, MARGIN = 2, FUN = min)
            MSSSD <- mean(Dmin^2)
            if (s == 1 | MSSSD < MSSSD_cur) {
              centers_best <- centers
              clusters_best <- cluster
              MSSSD_cur <- MSSSD
            }
            break
          }
        }
        print(paste0(s," out of ",nstarts))
      }
      list(centers = centers_best, cluster = clusters_best)
    }

## 3 - Define folders and load country and legacy data ===========================

  # Define location of country boundaries
    country_boundaries <- file.path(paste0(shp.path,"roi_epsg_3857.shp"))
    
  # Define location of soil legacy data
    legacy <- file.path(paste0(shp.path,"zmb_legacy_v2_clipped_epsg_3857.shp"))
    
  # Load and transform the country boundaries
    country_boundaries <- sf::st_read(country_boundaries, quiet=TRUE)
    if(crs(country_boundaries)!=epsg){
      country_boundaries <- country_boundaries %>%
        st_as_sf() %>% sf::st_transform(crs=epsg)
    }
  
  # Load legacy data (if it exists)
    if(file.exists(legacy)){
      legacy <- sf::st_read(legacy, quiet=TRUE)
    # Transform coordinates to the common projection system
      if(crs(legacy)!=epsg){
        legacy <- legacy %>%
          sf::st_transform(crs=epsg)
      }
    } else {
    # If legacy data does not exist delete the object "legacy"
      rm(legacy)
    } 
  
  ggplot(data = country_boundaries) + geom_sf() + geom_sf(data = legacy, aes(geometry = geometry))

## 4 - Load and transform optional explanatory variables ============================= 
  # Define location of non protected areas (raster)
    npa <- file.path(paste0(shp.path,"zmb_national_parks_zari_clipped_epsg_3857.shp"))
    
  # Define location of high slopes (binary raster with 1=<50% and NA = >=50%) - QGIS Calculator 
    slope <- file.path(paste0(raster.path,"zmb_clipped_slope_mask_epsg_3857.tif")) 
    
  # Define location of geology data
    geo <- file.path(paste0(shp.path,"zmb_geology_clipped_epsg_3857.shp"))
  
  # Define the field for geologic classes in the shape
    geo.classes <- "GEO"
    
  # Define location of geomorphology
    geomorph <- file.path(paste0(raster.path,"zmb_clipped_Geomorphon.tif"))
    
  # Define the field for geomorphology classes in the shape
    geomorph.classes <- "CODR"
    
  # Define location of landuse (binary raster with 1=landuse objetive and NA = other)
    landuse <- file.path(paste0(raster.path,"cropland_clipped_zmb_v1_epsg_3857.tif")) 
  
  # Load non protected areas (if it exists)
    if(file.exists(npa)){
      npa <- sf::st_read(npa, quiet = FALSE) # Import Protected area
      npa <- sf::st_union(npa)
      npa <- sf::st_difference(country_boundaries, npa)
      #npa <- rast(npa) 
      if(crs(npa)!=epsg){
        npa <- npa %>% 
          sf::st_transform(crs = epsg)
        #npa <- project(npa, epsg, method="near")
      }
    } else {
    # If non-protected areas data does not exist delete the object "npa"
      rm(npa)
    }
  
  # Load the reachable slopes < 50% raster (if it exists)
    if(file.exists(slope)){
      slope <- rast(slope)
      if(crs(slope)!=epsg){
       slope <- project(slope, epsg, method="near")
      } 
      slope <- slope/slope
    } else {
    # If slope data does not exist delete the object "slope"
      rm(slope)
    }
  
  # Load Geology (if it exists)
    if(file.exists(geo)){
      geo <- sf::st_read(geo, quiet=TRUE)
      if(crs(geo)!=epsg){
        geo <- geo %>%
          sf::st_transform(crs=epsg)
      }
      geo$GEO <- as.numeric(as.factor(geo[[geo.classes]]))
    } else {
      # If legacy data does not exist delete the object "geo"
      rm(geo)
    }
    
  # Load Geomorphology (if it exists)
    if (file.exists(geomorph)) {
      
      # Check the file extension to determine if it is a raster (.tif) or shapefile (.shp)
      file_extension <- tools::file_ext(geomorph)
      
      if (file_extension == "tif") {
        # If it's a TIFF file, no processing is needed
        geomorph <- rast(geomorph)
        names(geomorph) <- 'GEOMORPH'
        # No further action required for TIFF files
        if(crs(geomorph)!=epsg){
          geomorph <- project(geomorph, epsg, method="near") 
        }
      } else if (file_extension == "shp") {
        # If shapefile, execute the shapefile processing code
        geomorph <- sf::st_read(geomorph, quiet = TRUE)
        
        # Check and transform CRS if necessary
        if (sf::st_crs(geomorph)$epsg != epsg) {
          geomorph <- sf::st_transform(geomorph, crs = epsg)
        }
        
        geomorph$GEOMORPH <- as.numeric(as.factor(geomorph[[geomorph.classes]]))
        
      } else {
        # If the file is neither a raster nor a shapefile, handle the error or delete the object
        warning("File format not recognized. Expected .tif or .shp.")
        rm(geomorph)
      }
      
    } else {
      # If the file does not exist, delete the object "geomorph"
      rm(geomorph)
    }
    

## 5 - Load and transform covariate raster data ===========================

  # Load covariate data
    cov.dat <-  list.files(raster.path, pattern = "covs_zam_clipped.tif$",  recursive = TRUE, full.names = TRUE)
    cov.dat <- terra::rast(cov.dat) # SpatRaster from terra

  # Load soil climate data
    newhall <-  list.files(raster.path, pattern = "newhall_zam_clipped.tif$",  recursive = TRUE, full.names = TRUE)
    newhall <- terra::rast(newhall) # SpatRaster from terra
  
  # Delete regimeSubdivisions (don't needed)
    newhall$regimeSubdivision1 <- c()
    newhall$regimeSubdivision2 <- c()
  
  # Convert temperatureRegime and moistureRegime to dummy variables (1 = presence; 0 = absence)
    temperatureRegime <- dummies(ca.rast = newhall$temperatureRegime, preval = 1, absval = 0)
    moistureRegime <- dummies(ca.rast = newhall$moistureRegime, preval = 1, absval = 0)
    
  # Delete temperatureRegime and moistureRegime rasters from soil climate data
    newhall$temperatureRegime <- c()
    newhall$moistureRegime <- c()
    
  # Merge covs and climate data
    cov.dat <- c(cov.dat, newhall,temperatureRegime,moistureRegime)
    
  # Project covariates if necessary
    if(crs(cov.dat)!=epsg){
      cov.dat <- terra::project(cov.dat, epsg, method="near") 
    }
  
  # Transform Geology if exists
    if(exists("geo")){
      geo <- rasterize(as(geo,"SpatVector"), cov.dat,field="GEO")
      geo <- dummies(ca.rast = geo$GEO, preval = 1, absval = 0)
    } else {
    # If Geology data does not exist delete the object "geo"
      rm(geo)
    }
    
  # Merge covs and geology if exists)
    if(exists("geo")){
      cov.dat <- c(cov.dat, geo)
    } 
  
  # Transform geomorphology if exists and 
    # Check if the 'geomorph' object exists
    if (exists("geomorph")) {
      # Check if 'geomorph' is already a raster
      if (!inherits(geomorph, "SpatRaster")) {
        # If 'geomorph' is not a raster, convert it to a raster
        geomorph <- rasterize(as(geomorph, "SpatVector"), cov.dat, field = "GEOMORPH")
      }
      # Apply the dummies function, assuming geomorph is now a raster
      geomorph <- dummies(ca.rast = geomorph$GEOMORPH, preval = 1, absval = 0)
    }
    
  # Merge covs and geomorph (if exists)
    if (exists("geomorph")) {
      # Ensure both rasters have the same resolution and extent
      if (!identical(ext(cov.dat), ext(geomorph))) {
        geomorph <- extend(geomorph, cov.dat)
      }
      # Optionally, if they have different resolutions, resample geomorph to match cov.dat
      if (!all(res(cov.dat) == res(geomorph))) {
        geomorph <- resample(geomorph, cov.dat, method = "near")
      }
      # Merge cov.dat and geomorph
      cov.dat <- c(cov.dat, geomorph)
    }
    
  # Remove newhall SpatRaster and clean memory
    rm(newhall)
    rm(geomorph)
    gc()
  
  # Crop covariates on administrative boundary
    cov.dat <- crop(cov.dat, country_boundaries, mask=TRUE, overwrite=TRUE)
    writeRaster(cov.dat, paste0(raster.path,"cov_dat_stack.tif"),overwrite=TRUE)
    #cov.dat <- rast(paste0(raster.path,"cov_dat_stack.tif"))
    
  # Simplify raster information with PCA  
    pca <- synoptReg::raster_pca(cov.dat)  # Faster than with terra::princomp
    #Clean the NAs
  # Get SpatRaster layers from the pca object
    cov.dat <- pca$PCA
    summary(cov.dat)
  # Subset rasters to main PC (var. explained >= 0.99)
    n_comps <- first(which(pca$summaryPCA[3,] > 0.99))
    cov.dat <- pca$PCA[[1:n_comps]]

  # Save PCA rasters to results folder
    writeRaster(cov.dat,paste0(results.path,"PCA_projected.tif"),overwrite=TRUE)
    
  # Remove pca stack
    rm(pca)
  
  # Load pretreated PCA rasters
    #cov.dat <- rast(paste0(results.path,"PCA_projected.tif")) #
    

## 6 - Load Sampling Universe ===========================
  # Load land use data. We use 2 landuse Spatraster objects
    # A First layer, at 10 meter resolution, to define the crop area (crops), and a Second layer, at 1 ha resolution, to select PSUs (lu)
    crops <- rast(landuse) # 20 meter pixel resolution already projected to "EPSG:3857"
    crops <- crops/crops
    names(crops) <- "lu"
    plot(crops)
    # Cut landuse by non protected areas
    if(exists("npa")){
      # If npa is a shapefile
      crops <- mask(crops, npa)
      # If npa is a raster. Resample to match crops
      # npa <- resample(npa,crops, method="near")
      # crops <- crops * npa
    }
    rm(npa)
    
    # Cut # Load and transform the non-protected areas by slopes < 50%
    if(exists("slope")){
      # Resample to match crops
      slope <- resample(slope,crops, method="near")
      crops <- crops * slope
    }
    rm(slope)
    
    # Aggregate to ~ 1 ha pixel size (aggregated crops become lu)
    lu <- aggregate(crops, 5, fun=modal, cores = 8, na.rm=T) # (20 x 5) 100 meter pixel resolution
    names(lu) <- "lu"
    writeRaster(lu,paste0(raster.path,"cropland_zmb_100m_v1_epsg_3857.tif"),overwrite=TRUE)
    #lu <- rast(paste0(raster.path,"cropland_zmb_100m_v1_epsg_3857.tif"))
    
    # Filter legacy data to match landuse extent
    if (exists("legacy")){
      legacy$INSIDE <- terra::extract(crops, legacy) %>% dplyr::select(lu)
      legacy <- legacy[!is.na(legacy$INSIDE),] %>%
        dplyr::select(-"INSIDE")
    }

## 7 - Generate PSUs ===========================

  # Generate 2x2 km PSU vector grid within the country boundaries
    psu_grid <- st_make_grid(country_boundaries, cellsize = c(psu_size, psu_size), square = TRUE)
    psu_grid <- st_sf(geometry = psu_grid)
    psu_grid$ID <- 1:nrow(psu_grid)
    
  # Trim PSU grid by country boundary
     psu_grid <- psu_grid[country_boundaries[1],] # This process is highly time consuming
     write_sf(psu_grid,paste0(results.path,"../grid2k.shp"),overwrite=TRUE) # Save grid for further analyses
    # Load psu vector grid (saved from previous analyses to save time)
    # If you already did the saved the process, uncomment and use the following line instead of those above
     psu_grid <- sf::st_read(file.path(paste0(results.path,"../grid2k.shp"))) 
     
## 8 - Select PSUs with crops above a certain percent ===========================
     
  # Extract values of lu for cells that intersect with psu_grid
    extracted_values <- terra::extract(lu, psu_grid)
     
  # Summarize by grid ID and calculate percent according to the 1 ha reclassification of LU (400 pixels in 2x2 km)
    crop_perc <- extracted_values %>%
       group_by(ID) %>%
       summarize(crop_perc = sum(lu, na.rm = TRUE)*100/400)
  # Remove temporary object
    rm(extracted_values)
     
  # Join the result back to the psu_grid polygon data
    psu_grid$crop_perc <- crop_perc$crop_perc
    write_sf(psu_grid, file.path(paste0(results.path,"/psu_grid_counts.shp")), overwrite=TRUE)
    psu_grid <- sf::st_read(file.path(paste0(results.path,"/psu_grid_counts.shp"))) 
     
  # Plot the polygons with scaled colors based on crop percentage
    ggplot() +
       geom_sf(data = psu_grid, aes(fill = crop_perc)) +
       scale_fill_distiller(palette = "Spectral") +
       theme_minimal()
     
  # Subset PSUs with a minimal area of crops (defined above as "percent_crop")
    psu_grid <- psu_grid[psu_grid$crop_perc > percent_crop,"ID"]
  
  # Rasterize PSU vector grid
    template <- rast(vect(psu_grid), res = psu_size)
  
  # Transfer ID to the rasters
    template <- rasterize(vect(psu_grid), template, field = "ID")
     
## 9 - Rasterize PSUs ===========================
     
  # Crop covariates to the sampling universe
    cov.dat <- crop(cov.dat, psu_grid, mask=TRUE, overwrite=TRUE)
     
  # Resample covariates to the definition of PSUs 
    PSU.r <- resample(cov.dat, template)
     
## 10 - Determine PSUs by Covariate Space Coverage ===========================
     
  ## Prepare function parameters
  # Convert the raster stack information at PSU aggregated level to a dataframe with coordinates
    PSU.df <- as.data.frame(PSU.r,xy=T)
     
  # Get covariate names
    covs <- names(cov.dat)
     
  # Create dataframe of scaled covariates at the resolution of the PSUs (2x2km)
    mygrd <- data.frame(scale(PSU.df[, covs])) 
    
    if (exists("legacy")){
    # Prepare legacy data
    # Subset legacy data to the area of crops
      legacy <- st_filter(legacy,psu_grid)
    # Get the soil legacy coordinates that serve to define fixed cluster centers
      legacy_df <- st_coordinates(legacy)
    # Initialize a vector to store the indices of the closest points from legacy data to the dataframe of covariates 'PSU.df' 
      units <- numeric(nrow(legacy_df))
      
    # Loop through each point in 'legacy' to determine the minimum distance between covariates and legacy points
      for (i in 1:nrow(legacy_df)) {
        # Calculate distances from the current 'legacy' point to all points in the PSUs
        distances <- sqrt((PSU.df$x - legacy_df[i, "X"])^2 + (PSU.df$y - legacy_df[i, "Y"])^2)
        # Find the index of the minimum distance to identify the PSU for the legacy point
        units[i] <- which.min(distances)
      }
      
    # Select scaled information at legacy points
      fixed <- unique(data.frame(units, scale(PSU.df[, covs])[units, ])) 
      
    # Compute optimal sampling PSUs considering legacy data
    # If legacy data exists
      res <- CSIS(fixed = fixed, nsup = n.psu, nstarts = iterations, mygrd = mygrd)
    } else {
    # If legacy data does not exist
      res <- kmeans(mygrd, centers = n.psu, iter.max = 10000, nstart = 100)
    }
    
  # Transfer the results to the dataframe of PSUs to identify the cluster for each grid
    PSU.df$cluster <- res$cluster
    
  ## Calculate the distance of the centers to the scaled covariate space
    D <- rdist(x1 = res$centers, x2 = scale(PSU.df[, covs]))
    units <- apply(D, MARGIN = 1, FUN = which.min)
    
  ## Calculate the MSSSD for the selected trial
    dmin <- apply(D, MARGIN = 2, min)
    MSSSD <- mean(dmin^2)
    
  # Subset the selected PSU from all PSU in the country
    myCSCsample <- PSU.df[units, c("x", "y", covs)]
    
  # Identify type of PSU
    if (exists("legacy")){
    # If legacy data exists
      myCSCsample$type <- c(rep("legacy", nrow(fixed)), rep("new", length(units)-nrow(fixed)))
    } else {
    # If legacy data does not exist
      myCSCsample$type <- "new"
    }
    
  # Convert to spatial objet
    myCSCsample <-  myCSCsample %>%
      st_as_sf(coords = c("x", "y"), crs = epsg) 
    
  # Subset legacy and infill PSUs
    if (exists("legacy")){
      legacy <-  myCSCsample[myCSCsample$type=="legacy",] 
    }
    new <-  myCSCsample[myCSCsample$type=="new",] 
    
  # Intersect the PSU grid with the infill data to get the target PSU ids
    PSUs <- sf::st_intersection(psu_grid, new) %>% dplyr::select(ID)
    
  # Subset target PSUs
    target.PSUs <- psu_grid[psu_grid$ID %in% PSUs$ID,] %>% dplyr::select(ID)
    
  # Plot of target PSUs
    plot(PSU.r$PC1)
    plot(target.PSUs, col="red", add=TRUE)
    plot(new[1], col="green", pch=19, cex=0.5, add=TRUE)
    #plot(legacy[1], col="blue", pch=19, cex=0.5, add=TRUE)
    
  # Alternative plot - same result
    #jpeg(paste0(results.path,"/sampling_units.jpeg"), width = 8, height = 8, units = 'in', res = 300)
    ggplot() +
      geom_raster(data = as.data.frame(PSU.r$PC1, xy = TRUE), aes(x = x, y = y, fill = PC1)) +
      scale_fill_viridis_c() +
      #scale_fill_gradientn(colours = colorspace::diverge_hcl(7)) +
      geom_sf(data = legacy[1], aes(), color = "#A6AAA5", size = 0.2, shape = 19) +
      geom_sf(data = target.PSUs, color = "#101010", fill = NA, lwd = 0.8) +
      geom_sf(data = new[1], aes(), color = "#D81B60", size = 0.5, shape = 19, lwd = 0.7) +
      labs(title = "Target Primary Sampling Units",
           x = "Longitude",
           y = "Latitude",
           fill = "PC1") +
      theme_minimal()
    #dev.off()
    
    rm(new,dmin,MSSSD)
     
## 11 - Plot PSUs over covariate PC1 and PC2 information ===========================
     
   #  PSUs environmental representation over PC1 and PC2 of covariates
    ggplot(PSU.df) +
      geom_point(mapping = aes(x = PC1, y = PC2, colour = as.character(cluster)), alpha = 0.5) +
      scale_colour_viridis_d() +
      geom_point(data = myCSCsample, mapping = aes(x = PC1, y = PC2), size = .5, colour = "red") +
      scale_x_continuous(name = "PC1") +
      scale_y_continuous(name = "PC2") +
      theme(legend.position = "none") +
      ggtitle("Distribution of sampling PSUs over the space of environmental covariates") 
     
## 12 - Function to create SSUs and TSUs ===========================
     
    generate_tsu_points_within_ssu <- function(ssu, number_TSUs, index, ssu_type, crops) {
     # Convert SSU to SpatVector for masking
      ssu_vect <- ssu_grid_sf[index, ]
      
     # Clip the spatRaster to the SSU to focus the sampling within the SSU boundaries
      clipped_lu <- crop(crops, ssu_vect)
      
     # Generate random points within the clipped spatRaster using sample_srs
      sampled_points <- sample_srs(clipped_lu, nSamp = number_TSUs)  # Ensure this is compatible or modify
      
     # Make sure the TSUs falls within landuse areas
      while (nrow(sampled_points) < number_TSUs) {
        sampled_points <- spatSample(clipped_lu, size = number_TSUs)
      }
      
     # Add metadata to the sampled points
      sampled_points$PSU_ID <- selected_psu$ID
      sampled_points$SSU_ID <- index
      sampled_points$TSU_ID <- seq_len(nrow(sampled_points))
      sampled_points$SSU_Type <- ssu_type
      sampled_points$TSU_Name <- paste0(sampled_points$PSU_ID,".",sampled_points$SSU_ID,".",seq_len(nrow(sampled_points)))
      
      return(sampled_points)
    }
     
## 13 - Compute SSUs and TSUs ===========================
     
  # Initialize a list to store TSUs for all PSUs
    all_psus_tsus <- list()
  # Initialize a list to store target SSUS
    selected_ssus <- list()
    
    for (psu_id in 1:nrow(target.PSUs)) {
      selected_psu <- target.PSUs[psu_id, ]
      
    # Generate SSUs within the selected PSU
      ssu_grid <- st_make_grid(selected_psu, cellsize = c(ssu_size, ssu_size), square = TRUE)
      ssu_grid_sf <- st_sf(geometry = ssu_grid)
      
    # Convert ssu_grid_sf to SpatVector
      ssu_grid_vect <- vect(ssu_grid_sf)
      
    # Extract values of lu for cells that intersect with ssu_grid_vect
      extracted_values <- extract(crops, ssu_grid_vect, fun=table)
      
    # Add lu code to the SSUs    
      ssu_grid_sf$lu <- (extracted_values[,2]*100)/25
      ssu_grid_sf <- ssu_grid_sf[ssu_grid_sf$lu > percent_crop, ]
      #summary(ssu_grid_sf)
    
    # Subset ssu_grid_sf to get only the grid squares within lu
      #ssu_grid_sf <- ssu_grid_sf[!is.na(ssu_grid_sf$lu), ]
      #ssu_grid_sf <- ssu_grid_sf[ssu_grid_sf$lu>0, ]
      #plot(ssu_grid_sf)
      print(paste(psu_id, " out of ", nrow(target.PSUs)))
      
    # Count SSUs
      total_ssus <- nrow(ssu_grid_sf)
      
      if(total_ssus >= (num_primary_ssus + num_alternative_ssus)) {
        primary_ssus_indices <- sample(1:total_ssus, num_primary_ssus, replace = FALSE)
        available_for_alternatives <- setdiff(1:total_ssus, primary_ssus_indices)
        alternative_ssus_indices <- sample(available_for_alternatives, num_alternative_ssus, replace = FALSE)
        
        selected_ssus[[psu_id]] <- rbind(ssu_grid_sf[primary_ssus_indices, ], ssu_grid_sf[alternative_ssus_indices, ])
        
        primary_tsus <- lapply(primary_ssus_indices, function(index) {
          generate_tsu_points_within_ssu(ssu_grid_sf[index, ], number_TSUs, index, "Target",crops)
        })
        
      # Generate TSUs for alternative SSUs with naming
        alternative_tsus <- lapply(alternative_ssus_indices, function(index) {
          generate_tsu_points_within_ssu(ssu_grid_sf[index, ], number_TSUs, index, "Alternative",crops)
        })
        
      # Combine all TSUs of the current PSU into one sf object
        all_psus_tsus[[psu_id]] <- do.call(rbind, c(primary_tsus, alternative_tsus))
      } else {
        warning(paste("PSU", psu_id, "does not have enough SSUs for selection. Skipping."))
      }
    }
    
  # Combine TSUs from all PSUs into one sf object
    all_tsus <- do.call(rbind, all_psus_tsus)
    all_tsus$TSU_Type <- "Target"
    all_tsus[all_tsus$TSU_ID >1,"TSU_Type"] <- "Alternative"
    all_tsus$PSU_Type <- "Target"
    all_tsus <- all_tsus %>%
      dplyr::select("TSU_Name","PSU_ID","SSU_ID","TSU_ID","PSU_Type","SSU_Type","TSU_Type","geometry")
     
## 14 - View TSUs ===========================
   
  # Plot first PSU with target and alternative SSUs
    plot(selected_psu[1], col=NA, reset=FALSE, main="PSU")
    plot(ssu_grid_sf[primary_ssus_indices, ], col="blue", add=TRUE)
    plot(ssu_grid_sf[alternative_ssus_indices, ], col="red", add=TRUE)
    plot(all_tsus[1], col="green", pch=19, cex=0.5, add=TRUE)
    legend("bottomleft", 
           c("Target SSU", "Alternative SSU", "TSUs"), fill=c("blue", "red",  0), border=c("black","black",NA), horiz=F, cex=0.8, pch = c(NA,NA,3), col=c(NA,NA,"green"))
    
  # Alternative plot - Same result
  # Define the bounding box for the selected PSU
    bbox_psu <- st_bbox(selected_psu[1])
    lu_bbox = terra::crop(crops, selected_psu[1], mask = T, overwrite = T)
    plot(lu_bbox)
    PSU_bbox = terra::crop(cov.dat$PC1, selected_psu[1], mask = T, overwrite = T)
    plot(PSU_bbox)
    PSU_bbox = terra::resample(PSU_bbox, lu_bbox, method = "cubicspline") 
    
  # Define the labels for each type of data
    labels <- c("Target PSU", "Selected SSUs", "Alternative SSUs", "TSUs")
    #jpeg(paste0(results.path,"/Sampling_Units_PCA_250m_pixel.jpeg"), width = 8, height = 8, units = 'in', res = 300)
    ggplot() +
      geom_raster(data = as.data.frame(lu_bbox, xy = T), aes(x = x, y = y, fill = lu)) +
      #scale_fill_gradientn(colours = colorspace::diverge_hcl(7)) +
      guides(fill = "none")  +
      geom_sf(data = selected_psu[1], fill = NA, aes(color = labels[1]), lwd = 0.6, show.legend = TRUE) +
      geom_sf(data = ssu_grid_sf[primary_ssus_indices, ], fill = NA, aes(color = labels[2]), lwd = 0.6, show.legend = TRUE) +
      geom_sf(data = ssu_grid_sf[alternative_ssus_indices, ], fill = NA, aes(color = labels[3]), lwd = 0.6, show.legend = TRUE) +
      geom_sf(data = all_tsus, aes(geometry = geometry, color = labels[4]), size = 0.5, shape = 19, show.legend = TRUE) +
      coord_sf(xlim = c(bbox_psu["xmin"], bbox_psu["xmax"]), ylim = c(bbox_psu["ymin"], bbox_psu["ymax"])) +
      labs(title = "Target PSU, SSUs, and TSUs",
           x = "Longitude",
           y = "Latitude",
           color = "Legend") +
      scale_color_manual(values = c("Target PSU" = "blue", 
                                    "Selected SSUs" = "blue", 
                                    "Alternative SSUs" = "red", 
                                    "TSUs" = "black")) +
      theme_minimal() +
      theme(legend.position = "right", 
            legend.justification = "center",
            legend.box.margin = margin(0, 0, 0, 20))
    #dev.off()
     
## 15 - Write PSUs and TSUs ===========================
  # Convert clusters to raster
    dfr <- PSU.df[,c("x","y","cluster")]
    dfr$cluster <- as.numeric(dfr$cluster)    
    dfr <- rasterFromXYZ(dfr)
    crs(dfr) = epsg # Define the CRS
    
  # Extract cluster ID for the target PSUS
    PSU_cluster.id <- unlist(extract(dfr, target.PSUs))
    
    valid.PSU_clusters <-
      target.PSUs %>% mutate(
        cluster = extract(dfr, target.PSUs, fun = mean, na.rm = TRUE)
      )
    
    all.PSU_clusters <-
      psu_grid %>% mutate(
        cluster = extract(dfr, psu_grid, fun = mean, na.rm = TRUE) 
      )
    all.PSU_clusters <- na.omit(all.PSU_clusters)
    
    
  # Add cluster information to the TSUS
    valid.PSU_clusters <- valid.PSU_clusters %>%
      rename(Replace_ID= cluster) 
    
    all_tsus <- st_join(all_tsus, valid.PSU_clusters)
    
  # Add order of sampling for TSUs (target: 1-4, alternative: 5-7)
    all_tsus <- all_tsus %>%
      group_by(PSU_ID) %>%
      mutate(order = match(SSU_ID, unique(SSU_ID))) %>%
      ungroup()
    
  # Create final site ID
    all_tsus$site_id = paste0(ISO.code, all_tsus$PSU_ID, "-", all_tsus$order, "-", all_tsus$TSU_ID)
    
  # Export target PSU and TSU points
    write_sf(valid.PSU_clusters,paste0(results.path,"/PSUs_target.shp"), overwrite=TRUE)
    write_sf(all_tsus,paste0(results.path,"/TSUs_target.shp"), overwrite=TRUE) # Export TSUs
    
  # Write clusters to shape and tiff
    write_sf(all.PSU_clusters,paste0(results.path,"/PSU_pattern_cl.shp"), overwrite=TRUE)
    writeRaster(dfr, paste0(results.path,"/clusters.tif"), overwrite=TRUE)
    
## 16 -Calculate alternative PSUs ===========================
     
  # Calculate replacement PSUs
   # Step 1: Exclude elements present in valid.PSU_clusters from all.PSU_clusters
    remaining.PSU_clusters <- all.PSU_clusters %>%
      filter(!(ID %in% valid.PSU_clusters$ID))
    
   # Step 2: Get unique clustMin values from valid.PSU_clusters
    unique_cluster <- distinct(valid.PSU_clusters, Replace_ID)$Replace_ID
    
   # Initialize a vector to store indices of sampled replacements
    sampled_indices <- integer(0)
    
   # Loop through each unique clustMin to find a replacement
    for (clust in unique_cluster) {
      candidates_indices <- which(remaining.PSU_clusters$cluster == clust)
      
      if (length(candidates_indices) > 0) {
        sampled_index <- sample(candidates_indices, size = 1)
        sampled_indices <- c(sampled_indices, sampled_index)
      }
    }
    
  # Use the collected indices to slice the replacements from remaining.PSU_clusters
   # replacements contains a replacement for each unique cluster in valid.PSU_clusters
    replacements <- remaining.PSU_clusters[sampled_indices, ]
     
## 17 -  Determine SSUs and TSUs for alternative PSUs=============================
     
  # Initialize a list to store TSUs for all PSUs
    alt_psus_tsus_sf <- list()
    selected_ssus_sf <- list()
    
    for (psu_id in 1:nrow(replacements)) {
      selected_psu <- replacements[psu_id, ]
      
    # Generate SSUs within the selected PSU
      ssu_grid <- st_make_grid(selected_psu, cellsize = c(ssu_size, ssu_size), square = TRUE)
      ssu_grid_sf <- st_sf(geometry = ssu_grid)
      
    # Convert ssu_grid_sf to SpatVector
      ssu_grid_vect <- vect(ssu_grid_sf)
      
    # Extract values of lu for cells that intersect with ssu_grid_vect
      extracted_values <- extract(crops, ssu_grid_vect, fun=table)
      
    # Add lu code to the SSUs    
      ssu_grid_sf$lu <- (extracted_values[,2]*100)/25
      ssu_grid_sf <- ssu_grid_sf[ssu_grid_sf$lu > percent_crop, ]
      #summary(ssu_grid_sf)
      
    # Subset ssu_grid_sf to get only the grid squares within lu
      #ssu_grid_sf <- ssu_grid_sf[!is.na(ssu_grid_sf$lu), ]
      #ssu_grid_sf <- ssu_grid_sf[ssu_grid_sf$lu>0, ]
      #plot(ssu_grid_sf)
      print(paste(psu_id, " out of ", nrow(replacements)))
      
    # Count SSUs
      total_ssus <- nrow(ssu_grid_sf)
      
      if(total_ssus >= (num_primary_ssus + num_alternative_ssus)) {
        primary_ssus_indices <- sample(1:total_ssus, num_primary_ssus, replace = FALSE)
        available_for_alternatives <- setdiff(1:total_ssus, primary_ssus_indices)
        alternative_ssus_indices <- sample(available_for_alternatives, num_alternative_ssus, replace = FALSE)
        
        selected_ssus_sf[[psu_id]] <- rbind(ssu_grid_sf[primary_ssus_indices, ], ssu_grid_sf[alternative_ssus_indices, ])
        
      # Generate replacement TSUs for SSUs with naming
        primary_tsus <- lapply(primary_ssus_indices, function(index) {
          generate_tsu_points_within_ssu(ssu_grid_sf[index, ], number_TSUs, index, "Alternative",crops)
        })
      # Generate TSUs for alternative SSUs with naming
        alternative_tsus <- lapply(alternative_ssus_indices, function(index) {
          generate_tsu_points_within_ssu(ssu_grid_sf[index, ], number_TSUs, index, "Alternative",crops)
        })
        
      # Combine all TSUs of the current PSU into one sf object
        alt_psus_tsus_sf[[psu_id]] <- do.call(rbind, c(primary_tsus, alternative_tsus))
      } else {
        warning(paste("PSU", psu_id, "does not have enough SSUs for selection. Skipping."))
      }
    }
    
  # Combine TSUs from all PSUs into one sf object
    alt_tsus_combined_sf <- do.call(rbind, alt_psus_tsus_sf)
    alt_tsus_combined_sf$TSU_Type <- "Target"
    alt_tsus_combined_sf[alt_tsus_combined_sf$TSU_ID >1,"TSU_Type"] <- "Alternative"
    alt_tsus_combined_sf$PSU_Type <- "Alternative"
    
    alt_tsus_combined_sf <- alt_tsus_combined_sf %>%
      dplyr::select("TSU_Name","PSU_ID","SSU_ID","TSU_ID","PSU_Type","SSU_Type","TSU_Type","geometry")
     
## 18 - Plot SSUs and TSUs ===========================
     
  # Plot of alternative PSUs
    plot(cov.dat$PC1, main="Alternative PSUs Distribution")
    plot(country_boundaries[1], col=NA, reset=FALSE, add=TRUE)
    plot(replacements[1], col="red", add=TRUE)
    plot(alt_tsus_combined_sf[1], col="black", pch=19, cex=0.5, add=TRUE)
    
  # Plot first alternative PSU with target and alternative SSUs
    plot(selected_psu[1], col=NA, reset=FALSE, main="Alternative PSU")
    plot(ssu_grid_sf[primary_ssus_indices, ], col="blue", add=TRUE)
    plot(ssu_grid_sf[alternative_ssus_indices, ], col="red", add=TRUE)
    plot(alt_tsus_combined_sf[1], col="green", pch=19, cex=0.5, add=TRUE)
    legend("bottomleft", 
           c("Target SSU", "Alternative SSU", "Alternative TSUs"), fill=c("blue", "red",  0), border=c("black","black",NA), horiz=F, cex=0.8, pch = c(NA,NA,3), col=c(NA,NA,"green"))
    
  # Alternative plot - Same result
   # Define the bounding box for the selected PSU
    bbox_psu <- st_bbox(selected_psu[1])
    lu_bbox = terra::crop(crops, selected_psu[1], mask = T, overwrite = T)
    plot(lu_bbox)
    
   # Define the labels for each type of data
    labels <- c("Alternative PSU", "Target SSUs", "Alternative SSUs", "Alternative TSUs")
    #jpeg(paste0(results.path,"/Alternative_Sampling_Units_LU_100m_pixel.jpeg"), width = 8, height = 8, units = 'in', res = 300)
    ggplot() +
      geom_raster(data = as.data.frame(lu_bbox, xy = T), aes(x = x, y = y, fill = NA)) +
      #scale_fill_gradientn(colours = colorspace::diverge_hcl(7)) + #scale_fill_viridis_c() +
      guides(fill = "none")  +
      geom_sf(data = selected_psu[1], fill = NA, aes(color = labels[1]), lwd = 0.6, show.legend = TRUE) +
      geom_sf(data = ssu_grid_sf[primary_ssus_indices, ], fill = NA, aes(color = labels[2]), lwd = 0.6, show.legend = TRUE) +
      geom_sf(data = ssu_grid_sf[alternative_ssus_indices, ], fill = NA, aes(color = labels[3]), lwd = 0.6, show.legend = TRUE) +
      geom_sf(data = alt_tsus_combined_sf[1], aes(geometry = geometry, color = labels[4]), size = 0.5, shape = 19, show.legend = TRUE) +
      coord_sf(xlim = c(bbox_psu["xmin"], bbox_psu["xmax"]), ylim = c(bbox_psu["ymin"], bbox_psu["ymax"])) +
      labs(title = "Alternative PSU",
           x = "Longitude",
           y = "Latitude",
           color = "Legend") +
      scale_color_manual(values = c("Alternative PSU" = "red", 
                                    "Target SSUs" = "blue", 
                                    "Alternative SSUs" = "red", 
                                    "Alternative TSUs" = "black")) +
      theme_minimal() +
      theme(legend.position = "right", 
            legend.justification = "center",
            legend.box.margin = margin(0, 0, 0, 20))
    #dev.off()
    
  # Add cluster information to the TSUS
    replacements <- replacements %>%
      rename(Replace_ID= cluster)
    
    alt_tsus_combined_sf <- st_join(alt_tsus_combined_sf, replacements)
    
  # Add order of sampling for TSUs (target: 1-4, alternative: 5-7)
    alt_tsus_combined_sf <- alt_tsus_combined_sf %>%
      group_by(PSU_ID) %>%
      mutate(order = match(SSU_ID, unique(SSU_ID))) %>%
      ungroup()
    
  # Create final site ID
    alt_tsus_combined_sf$site_id = paste0(ISO.code, alt_tsus_combined_sf$PSU_ID, "-", alt_tsus_combined_sf$order, "-", alt_tsus_combined_sf$TSU_ID)
     
## 19 - Plot and export SSUs and TSUs ===========================
     
  # Export to shapefile
    write_sf(replacements,paste0(results.path,"/PSUs_replacements.shp"), overwrite=TRUE)
    write_sf(alt_tsus_combined_sf,paste0(results.path,"/TSUs_replacements.shp"), overwrite=TRUE)
     
## 20 - Count number of PSU available for each cluster ===========================
     
  # Count number of PSU
    valid_counts <- valid.PSU_clusters %>%
      group_by(Replace_ID) %>%
      summarise(Count = n())
    
  # Count clusters in remaining.PSU_clusters
    remaining_counts <- remaining.PSU_clusters %>%
      group_by(cluster) %>%
      summarise(Count = n())
    
  # Join to see availability
    availability <- st_join(valid_counts, remaining_counts, by = "cluster", suffix = c("_valid", "_remaining"))
    write_sf(availability,paste0(results.path,"/availability.shp"), overwrite=TRUE)
    
  # Save target and replacement PSU as an single shapefile
    
    tar <- sf::st_read(file.path(paste0(results.path,"PSUs_target.shp")))
    repl<- sf::st_read(file.path(paste0(results.path,"PSUs_replacements.shp")))
    crop_PSU <- rbind(tar,repl)
    crop_PSU <- crop_PSU %>%
      group_by(Replace_ID) %>%
      summarize(geometry = st_union(geometry))
    
    write_sf(crop_PSU,paste0(results.path,"/target_repl_PSUs.shp"), overwrite=TRUE) # Export projected landuse
    
### ### ### END  ### ### ### 