
# Script to generate the average temperature and precipitation
## Temperature and precipitation data were retrieved from GEE 
## (file: gee_climate_vars)


## 0 - Set environment and load libraries ===========================

# Set working directory to source file location
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
setwd("../") # Move wd down to the main folder
getwd()

# List of packages
packages <- c("terra")

# Load packages
invisible(lapply(packages, library, character.only = TRUE))
rm(packages)

## 1 - User-defined variables ==================================================

# Path to rasters
raster.path <- "data/rasters/"

## 2 - Import and prepare data =================================================

# Temperature
tmp <- rast(paste0(raster.path, "Average_Temp_2001_uptodate.tif"))

# Precipitation
prec_mm <- rast(paste0(raster.path, "Prec_2001_uptodate.tif"))


## 3 - Processing Temperature ==================================================

# Get one month temperature (January)
tmp_Jan_1 <- tmp[[1]]
dim(tmp_Jan_1)

# Create empty list
Rlist<-list()

# Average of all years (j) and 12 months (i) 
for (i in 1:12) { 
  var_sum<-tmp_Jan_1*0
  k<-i
  
  for (j in 1:(dim(tmp)[3]/12)) {
    print(k)
    var_sum<-(var_sum + tmp[[k]])
    
    k<-k+12
    
  }

  #Save each month average. 
  
  var_avg<-var_sum/(dim(tmp)[3]/12)
  
  #writeRaster(ra,filename=name, format="GTiff")
  Rlist[[i]]<-var_avg
}

#Exporting a stack of months averages
Temp_Stack<-rast(Rlist)
Temp_Stack<-Temp_Stack*0.1 # re-scale to Celsius
writeRaster(Temp_Stack,filename='Temp_Stack_01-22_TC.tif',overwrite=TRUE)

## 4 - Processing Precipitation ================================================

# Have one month Precipitation ( January)
pre_Jan_1<-prec_mm[[1]]
dim(pre_Jan_1)

# Create empty list
Rlist<-list()

# Average of all years (j) and 12 months (i) 
for (i in 1:12) { 
  
  var_sum<-pre_Jan_1*0
  k<-i
  
  for (j in 1:(dim(prec_mm)[3]/12)) {
    print(k)
    var_sum<-(var_sum + prec_mm[[k]])
    
    k<-k+12
    
  }
  #Save each month average. 
  
  var_avg<-var_sum/(dim(prec_mm)[3]/12)
  
  #writeRaster(ra,filename=name, format=overwrite=TRUE)
  Rlist[[i]]<-var_avg
}


# Exporting a stack of months averages

Prec_Stack<-rast(Rlist)
writeRaster(Prec_Stack,filename='Prec_Stack_01-22_TC.tif',overwrite=TRUE)


## 5 - Merging temperature and precipitation - Main output  ====================

# Define the desired column names
prec_colnames <- c("pJan", "pFeb", "pMar", "pApr", "pMay", "pJun", 
                   "pJul", "pAug", "pSep", "pOct", "pNov", "pDec")
temp_colnames <- c("tJan", "tFeb", "tMar", "tApr", "tMay", "tJun", 
                   "tJul", "tAug", "tSep", "tOct", "tNov", "tDec")

# Rename the layers for precipitation stack
names(Prec_Stack) <- prec_colnames

# Rename the layers for temperature stack
names(Temp_Stack) <- temp_colnames

# Combine the two stacks into one
combined_stack <- c(Prec_Stack, Temp_Stack)
names(combined_stack)
print(combined_stack)

# Exporting the final output
writeRaster(combined_stack, filename='climate_vars.tif', overwrite=TRUE)

