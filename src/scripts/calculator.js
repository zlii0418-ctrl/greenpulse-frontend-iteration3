
function saveSliderValues(key, value) {
  localStorage.setItem(key, value)
}


function getSliderValue(key, defaultValue = 0) {
  const value = localStorage.getItem(key)
  return value !== null ? parseInt(value) : defaultValue
}


function calculateCarFootprint(distance, size, fuelType) {

  let emissionFactor = 0


  const normalizedFuelType = fuelType.toLowerCase()


  if (size === 'small') {
    switch (normalizedFuelType) {
      case 'diesel':
        emissionFactor = 0.1434
        break
      case 'petrol':
        emissionFactor = 0.14308
        break
      case 'hybrid':
        emissionFactor = 0.11413
        break
      case 'phev':
        emissionFactor = 0.03008
        break
      case 'bev':
        emissionFactor = 0.0
        break
      default:
        emissionFactor = 0.14308 
    }
  } else if (size === 'medium') {
    switch (normalizedFuelType) {
      case 'diesel':
        emissionFactor = 0.17174
        break
      case 'petrol':
        emissionFactor = 0.17474
        break
      case 'hybrid':
        emissionFactor = 0.11724
        break
      case 'phev':
        emissionFactor = 0.07789
        break
      case 'bev':
        emissionFactor = 0.0
        break
      default:
        emissionFactor = 0.17474 
    }
  } else if (size === 'large') {
    switch (normalizedFuelType) {
      case 'diesel':
        emissionFactor = 0.21007
        break
      case 'petrol':
        emissionFactor = 0.26828
        break
      case 'hybrid':
        emissionFactor = 0.1565
        break
      case 'phev':
        emissionFactor = 0.10033
        break
      case 'bev':
        emissionFactor = 0.0
        break
      default:
        emissionFactor = 0.26828 
    }
  } else if (size === 'default') {
    // Default emission factor for simple forms
    emissionFactor = 0.16272
  } else {
    switch (normalizedFuelType) {
      case 'diesel':
        emissionFactor = 0.17304
        break
      case 'petrol':
        emissionFactor = 0.16272
        break
      case 'hybrid':
        emissionFactor = 0.12825
        break
      case 'phev':
        emissionFactor = 0.09167
        break
      case 'bev':
        emissionFactor = 0.0
        break
      default:
        emissionFactor = 0.16272 
    }
  }


  return distance * emissionFactor
}


function calculateMotorcycleFootprint(distance, size) {

  let emissionFactor = 0


  switch (size) {
    case 'small':
      emissionFactor = 0.08319 
      break
    case 'medium':
      emissionFactor = 0.10107 
      break
    case 'large':
      emissionFactor = 0.13252 
      break
    case 'default':
      // Default emission factor for simple forms
      emissionFactor = 0.11367
      break
    default:
      emissionFactor = 0.11367
  }


  return distance * emissionFactor
}


function calculatePublicTransportFootprint(distances) {

  const factors = {
    lrt: 0.10449, 
    mrt: 0.12694, 
    ktm: 0.18034, 
    monorail: 0.09211, 
    bus: 0.10385, 
  }


  let totalEmission = 0
  const individualEmissions = {}
  for (const [type, distance] of Object.entries(distances)) {
    if (factors[type] && distance > 0) {
      const emission = distance * factors[type]
      individualEmissions[type] = emission
      totalEmission += emission
    } else {
      individualEmissions[type] = 0
    }
  }


  const submissionPath = getSubmissionPath()
  const publicTransport1 = getSliderValue('public_transport_distance_1', 0)
  const publicTransport2 = getSliderValue('public_transport_distance_2', 0)

  
  // Only include simple public transport values if detailed was not submitted
  if (publicTransport1 > 0 && submissionPath !== 'public_detailed') {
    const emission = publicTransport1 * 0.10385
    individualEmissions.bus_simple = emission
    totalEmission += emission
  } else {
    individualEmissions.bus_simple = 0
  }

  if (publicTransport2 > 0 && submissionPath !== 'public_detailed') {
    const emission = publicTransport2 * 0.12597
    individualEmissions.train_simple = emission
    totalEmission += emission
  } else {
    individualEmissions.train_simple = 0
  }

  return {
    total: totalEmission,
    breakdown: individualEmissions
  }
}

function calculateTreesNeeded(totalEmission) {
  // Tree saplings growing for 10 years needed to offset the total emission
  const treesNeeded = totalEmission / 60.5

  return treesNeeded
}


function calculateTotalFootprint() {
  const submissionPath = getSubmissionPath()
  
  // Calculate car footprint - exclude simple values if detailed was submitted
  let carFootprint = 0
  for (let i = 1; i <= 5; i++) {
    const distance = getSliderValue(`car_distance_${i}`, 0)
    if (distance > 0) {
      // If detailed private was submitted, only include detailed values (i > 1)
      // If simple private was submitted or no submission, include all values
      if (submissionPath === 'private_detailed' && i === 1) {
        continue // Skip simple car values when detailed was submitted
      }
      
      const size = localStorage.getItem(`car_size_${i}`) || 'default'
      const fuelType = localStorage.getItem(`car_fuel_${i}`) || 'default'
      carFootprint += calculateCarFootprint(distance, size, fuelType)
    }
  }

  // Calculate motorcycle footprint - exclude simple values if detailed was submitted
  let motorcycleFootprint = 0
  for (let i = 1; i <= 5; i++) {
    const distance = getSliderValue(`motorcycle_distance_${i}`, 0)
    if (distance > 0) {
      // If detailed private was submitted, only include detailed values (i > 1)
      // If simple private was submitted or no submission, include all values
      if (submissionPath === 'private_detailed' && i === 1) {
        continue // Skip simple motorcycle values when detailed was submitted
      }
      
      const size = localStorage.getItem(`motorcycle_size_${i}`) || 'default'
      motorcycleFootprint += calculateMotorcycleFootprint(distance, size)
    }
  }

  
  // Calculate public transport footprint - exclude simple values if detailed was submitted
  // Priority: detailed values if available, otherwise simple values
  const publicTransportDistances = {
    lrt: getSliderValue('lrt_distance_detailed', 0) || (submissionPath !== 'public_detailed' ? getSliderValue('lrt_distance', 0) : 0),
    mrt: getSliderValue('mrt_distance_detailed', 0) || (submissionPath !== 'public_detailed' ? getSliderValue('mrt_distance', 0) : 0),
    ktm: getSliderValue('ktm_distance_detailed', 0) || (submissionPath !== 'public_detailed' ? getSliderValue('ktm_distance', 0) : 0),
    monorail: getSliderValue('monorail_distance_detailed', 0) || (submissionPath !== 'public_detailed' ? getSliderValue('monorail_distance', 0) : 0),
    bus: getSliderValue('bus_distance_detailed', 0) || (submissionPath !== 'public_detailed' ? getSliderValue('bus_distance', 0) : 0),
  }
  const publicTransportResult = calculatePublicTransportFootprint(publicTransportDistances)
  const publicTransportFootprint = publicTransportResult.total

  
  const totalFootprint = carFootprint + motorcycleFootprint + publicTransportFootprint

 
  const treesNeeded = calculateTreesNeeded(totalFootprint)

  
  localStorage.setItem('total_footprint', totalFootprint.toFixed(2))
  localStorage.setItem('trees_needed', treesNeeded)

  
  localStorage.setItem('car_footprint', carFootprint.toFixed(2))
  localStorage.setItem('motorcycle_footprint', motorcycleFootprint.toFixed(2))
  localStorage.setItem('public_transport_footprint', publicTransportFootprint.toFixed(2))

  return {
    totalFootprint,
    treesNeeded,
    carFootprint,
    motorcycleFootprint,
    publicTransportFootprint,
    publicTransportBreakdown: publicTransportResult.breakdown,
  }
}

function setSubmissionPath(path) {
  localStorage.setItem('submission_path', path)
}

function getSubmissionPath() {
  return localStorage.getItem('submission_path') || 'simple'
}

function clearAllValues() {
  // Clear all car values
  for (let i = 1; i <= 5; i++) {
    localStorage.removeItem(`car_distance_${i}`)
    localStorage.removeItem(`car_size_${i}`)
    localStorage.removeItem(`car_fuel_${i}`)
  }
  
  // Clear all motorcycle values
  for (let i = 1; i <= 5; i++) {
    localStorage.removeItem(`motorcycle_distance_${i}`)
    localStorage.removeItem(`motorcycle_size_${i}`)
  }
  
  // Clear all public transport values (both simple and detailed)
  const publicTransportKeys = [
    'public_transport_distance_1', 'public_transport_distance_2',
    'lrt_distance', 'mrt_distance', 'ktm_distance', 'monorail_distance', 'bus_distance',
    'lrt_distance_detailed', 'mrt_distance_detailed', 'ktm_distance_detailed', 
    'monorail_distance_detailed', 'bus_distance_detailed'
  ]
  
  publicTransportKeys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  // Clear calculated results
  localStorage.removeItem('total_footprint')
  localStorage.removeItem('trees_needed')
  localStorage.removeItem('car_footprint')
  localStorage.removeItem('motorcycle_footprint')
  localStorage.removeItem('public_transport_footprint')
  localStorage.removeItem('submission_path')
}


window.calculatorUtils = {
  saveSliderValues,
  getSliderValue,
  calculateTotalFootprint,
  setSubmissionPath,
  getSubmissionPath,
  clearAllValues,
}


