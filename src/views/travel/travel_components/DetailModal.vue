<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="close-button" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Private Vehicle Details -->
        <div v-if="modalType === 'private'" class="private-details">
          <!-- Car Section -->
          <div class="vehicle-section">
            <div class="detail-header">
              <div class="car-header-container">
                <button class="info-button" @click="showCarInfo" title="Car Information">
                  <span class="info-icon">i</span>
                </button>
                <img class="car-icon" :src="sportCarIcon" alt="Car" />
              </div>
              <div class="header-labels">
                <span class="label-text">Size</span>
                <span class="label-text">Distance</span>
                <span class="label-text">Fuel</span>
              </div>
              <div class="add-button">
                <img :src="addIcon" alt="Add" @click="addCarRow" />
              </div>
            </div>
            
            <div v-for="(vehicle, index) in privateVehicles.cars" :key="`car-${index}`" class="vehicle-row">
              <div class="row-number">{{ index + 1 }}</div>
              
              <div class="size-select">
                <select v-model="vehicle.size" class="custom-select">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div class="fuel-select">
                <select v-model="vehicle.fuel" class="custom-select">
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="phev">Plug-in Hybrid Electric Vehicle</option>
                  <option value="bev">Battery Electric Vehicle</option>
                </select>
              </div>
              
              <div class="distance-slider">
                <input 
                  type="range" 
                  class="gradient-slider car-slider" 
                  min="0" 
                  max="800" 
                  v-model.number="vehicle.distance" 
                  step="1"
                >
                <div class="distance-display">
                  <span class="distance-value">{{ vehicle.distance }}</span>
                  <span class="distance-unit">unit: km</span>
                </div>
              </div>
              
              <div class="delete-button" @click="removeCarRow(index)">Delete</div>
            </div>
          </div>
          
          <!-- Motorcycle Section -->
          <div class="vehicle-section">
            <div class="detail-header">
              <div class="motorcycle-header-container">
                <button class="info-button" @click="showMotorcycleInfo" title="Motorcycle Information">
                  <span class="info-icon">i</span>
                </button>
                <img class="motorcycle-icon" :src="motorbikeIcon" alt="Motorcycle" />
              </div>
            <div class="header-labels motorcycle-labels">
              <span class="label-text">Size</span>
              <span class="label-text">Distance</span>
            </div>
              <div class="add-button">
                <img :src="addIcon" alt="Add" @click="addMotorcycleRow" />
              </div>
            </div>
            
            <div v-for="(motorcycle, index) in privateVehicles.motorcycles" :key="`motorcycle-${index}`" class="vehicle-row">
              <div class="row-number">{{ index + 1 }}</div>
              
              <div class="size-select">
                <select v-model="motorcycle.size" class="custom-select">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div class="fuel-display">
                <span class="fuel-text">Petrol Only</span>
              </div>
              
              <div class="distance-slider">
                <input 
                  type="range" 
                  class="gradient-slider motorcycle-slider" 
                  min="0" 
                  max="800" 
                  v-model.number="motorcycle.distance" 
                  step="1"
                >
                <div class="distance-display">
                  <span class="distance-value">{{ motorcycle.distance }}</span>
                  <span class="distance-unit">unit: km</span>
                </div>
              </div>
              
              <div class="delete-button" @click="removeMotorcycleRow(index)">Delete</div>
            </div>
          </div>
        </div>
        
        <!-- Public Transport Details -->
        <div v-else-if="modalType === 'public'" class="public-details">
          <div class="detail-header">
            <span class="label-text">Type</span>
            <span class="label-text">Distance</span>
          </div>
          
          <div class="transport-row">
            <div class="transport-type">LRT</div>
            <div class="transport-slider">
              <input 
                type="range" 
                class="gradient-slider lrt-slider" 
                min="0" 
                max="800" 
                v-model.number="publicTransport.lrt" 
                step="1"
              >
              <div class="distance-display">
                <span class="distance-value">{{ publicTransport.lrt }}</span>
                <span class="distance-unit">unit: km</span>
              </div>
            </div>
          </div>
          
          <div class="transport-row">
            <div class="transport-type">MRT</div>
            <div class="transport-slider">
              <input 
                type="range" 
                class="gradient-slider mrt-slider" 
                min="0" 
                max="800" 
                v-model.number="publicTransport.mrt" 
                step="1"
              >
              <div class="distance-display">
                <span class="distance-value">{{ publicTransport.mrt }}</span>
                <span class="distance-unit">unit: km</span>
              </div>
            </div>
          </div>
          

          
          
          <div class="transport-row">
            <div class="transport-type">KTM</div>
            <div class="transport-slider">
              <input 
                type="range" 
                class="gradient-slider ktm-slider" 
                min="0" 
                max="800" 
                v-model.number="publicTransport.ktm" 
                step="1"
              >
              <div class="distance-display">
                <span class="distance-value">{{ publicTransport.ktm }}</span>
                <span class="distance-unit">unit: km</span>
              </div>
            </div>
          </div>
          
          <div class="transport-row">
            <div class="transport-type">Monorail</div>
            <div class="transport-slider">
              <input 
                type="range" 
                class="gradient-slider monorail-slider" 
                min="0" 
                max="800" 
                v-model.number="publicTransport.monorail" 
                step="1"
              >
              <div class="distance-display">
                <span class="distance-value">{{ publicTransport.monorail }}</span>
                <span class="distance-unit">unit: km</span>
              </div>
            </div>
          </div>
          
          <div class="transport-row">
            <div class="transport-type">Bus</div>
            <div class="transport-slider">
              <input 
                type="range" 
                class="gradient-slider bus-slider" 
                min="0" 
                max="800" 
                v-model.number="publicTransport.bus" 
                step="1"
              >
              <div class="distance-display">
                <span class="distance-value">{{ publicTransport.bus }}</span>
                <span class="distance-unit">unit: km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Cancel</button>
        <button class="btn btn-primary" @click="saveDetails">Submit</button>
      </div>
    </div>
    
    <!-- Car Information Popup -->
    <div v-if="showCarInfoPopup" class="info-popup" @click="closeCarInfo">
      <div class="popup-content" @click.stop>
        <h3>Car Information</h3>
        <div class="popup-section">
          <h4>Size</h4>
          <p><strong>Small:</strong> Compact cars (up to 1.4L) - very fuel efficient</p>
          <p><strong>Medium:</strong> Standard cars (1.4-2.0L) - good balance of power and efficiency</p>
          <p><strong>Large:</strong> Large cars and SUVs (2.0L+) - higher fuel consumption</p>
        </div>
        <div class="popup-section">
          <h4>Fuel Type</h4>
          <p><strong>Diesel:</strong> More fuel efficient, lower CO2 emissions per km</p>
          <p><strong>Petrol:</strong> Standard gasoline fuel</p>
          <p><strong>Hybrid:</strong> Combines petrol engine with electric motor</p>
          <p><strong>Plug-in Hybrid:</strong> Can be charged from external power source</p>
          <p><strong>Battery Electric:</strong> Fully electric, zero direct emissions</p>
        </div>
        <button @click="closeCarInfo" class="popup-close-btn">Close</button>
      </div>
    </div>
    
    <!-- Motorcycle Information Popup -->
    <div v-if="showMotorcycleInfoPopup" class="info-popup" @click="closeMotorcycleInfo">
      <div class="popup-content" @click.stop>
        <h3>Motorcycle Information</h3>
        <div class="popup-section">
          <h4>Size</h4>
          <p><strong>Small:</strong> Mopeds/scooters up to 125cc - very fuel efficient</p>
          <p><strong>Medium:</strong> Standard motorcycles (125-500cc) - good balance of power and efficiency</p>
          <p><strong>Large:</strong> Large motorcycles and touring bikes (500cc+) - higher fuel consumption</p>
        </div>
        <div class="popup-section">
          <h4>Fuel</h4>
          <p><strong>For motorcycles, only petrol is considered</strong></p>
          <p>Motorcycles typically use petrol fuel. Electric motorcycles are still relatively rare and are not included in this calculation.</p>
        </div>
        <button @click="closeMotorcycleInfo" class="popup-close-btn">Close</button>
      </div>
    </div>
    
    <!-- Toast Notification -->
    <div v-if="showToast" class="toast-notification">
      <div class="toast-content">
        <span class="toast-message">{{ toastMessage }}</span>
        <button @click="showToast = false" class="toast-close">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import sportCarIcon from '@/assets/img/sport-car.png'
import motorbikeIcon from '@/assets/img/motorbike.png'
import trainIcon from '@/assets/img/train.png'
import busIcon from '@/assets/img/bus.png'
import addIcon from '@/assets/img/add.png'

interface PrivateVehicle {
  size: string
  fuel: string
  distance: number
}

interface Motorcycle {
  size: string
  distance: number
}

interface PrivateVehicles {
  cars: PrivateVehicle[]
  motorcycles: Motorcycle[]
}

interface PublicTransport {
  lrt: number
  mrt: number
  ktm: number
  monorail: number
  bus: number
}

const props = defineProps<{
  isVisible: boolean
  title: string
  modalType: 'private' | 'public'
  initialData?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: any]
  next: []
}>()

// Private vehicle data
const privateVehicles = ref<PrivateVehicles>({
  cars: [{ size: 'medium', fuel: 'petrol', distance: 0 }],
  motorcycles: [{ size: 'medium', distance: 0 }]
})

// Public transport data
const publicTransport = ref<PublicTransport>({
  lrt: 0,
  mrt: 0,
  ktm: 0,
  monorail: 0,
  bus: 0
})

// Info popup states
const showCarInfoPopup = ref(false)
const showMotorcycleInfoPopup = ref(false)

// Toast notification state
const toastMessage = ref('')
const showToast = ref(false)

// Watch for initial data changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    if (props.modalType === 'private' && newData.vehicles) {
      privateVehicles.value = newData.vehicles
    } else if (props.modalType === 'public' && newData.transport) {
      publicTransport.value = { ...publicTransport.value, ...newData.transport }
    }
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

// Car methods
const addCarRow = () => {
  if (privateVehicles.value.cars.length >= 5) {
    showToastMessage('You can only add up to 5 car rows.')
    return // Maximum 5 car rows allowed
  }
  privateVehicles.value.cars.push({ size: 'medium', fuel: 'petrol', distance: 0 })
}

const removeCarRow = (index: number) => {
  if (privateVehicles.value.cars.length > 1) {
    privateVehicles.value.cars.splice(index, 1)
  }
}

// Motorcycle methods
const addMotorcycleRow = () => {
  if (privateVehicles.value.motorcycles.length >= 5) {
    showToastMessage('You can only add up to 5 motorcycle rows.')
    return // Maximum 5 motorcycle rows allowed
  }
  privateVehicles.value.motorcycles.push({ size: 'medium', distance: 0 })
}

const removeMotorcycleRow = (index: number) => {
  if (privateVehicles.value.motorcycles.length > 1) {
    privateVehicles.value.motorcycles.splice(index, 1)
  }
}

const saveDetails = () => {
  const data = props.modalType === 'private' 
    ? { vehicles: privateVehicles.value }
    : { transport: publicTransport.value }
  
  emit('save', data)
  closeModal()
}

// Info popup methods
const showCarInfo = () => {
  showCarInfoPopup.value = true
}

const closeCarInfo = () => {
  showCarInfoPopup.value = false
}

const showMotorcycleInfo = () => {
  showMotorcycleInfoPopup.value = true
}

const closeMotorcycleInfo = () => {
  showMotorcycleInfoPopup.value = false
}

// Toast notification methods
const showToastMessage = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000) // Hide after 3 seconds
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0px 20px 20px 20px;
  z-index: 10000;
  overflow-y: auto;
}

.modal-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  width: 95%;
  max-width: 900px;
  max-height: calc(100vh - 80px);
  min-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    20px 20px 60px rgba(0, 0, 0, 0.1),
    -20px -20px 60px rgba(255, 255, 255, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  margin: 0 auto;
  z-index: 10000;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8));
  border-radius: 20px 20px 0 0;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.close-button {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.1),
    -4px -4px 8px rgba(255, 255, 255, 0.8);
}

.close-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.15),
    -6px -6px 12px rgba(255, 255, 255, 1);
}

.close-button svg {
  color: #718096;
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  max-height: calc(100vh - 180px); /* Account for header, footer, and padding */
}

/* Show scrollbar for modal body */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.modal-body {
  scrollbar-width: thin;  /* Firefox */
  scrollbar-color: #c1c1c1 #f1f1f1;  /* Firefox */
}

/* Private vehicle details styles */
.private-details {
  width: 100%;
}

.vehicle-section {
  margin-bottom: 30px;
}

.vehicle-section:last-child {
  margin-bottom: 0;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.8);
  position: relative;
}

.car-header-container,
.motorcycle-header-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 20px;
}

.car-icon,
.motorcycle-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.header-labels {
  display: flex;
  flex: 1;
  margin-right: 20px;
}

.header-labels .label-text:nth-child(1) { /* Size */
  margin-right: 70px;
}

.header-labels .label-text:nth-child(2) { /* Distance */
  margin-right: 120px; /* Adjust spacing between Distance and Fuel */
}

.motorcycle-labels {
  display: flex;
}

.motorcycle-labels .label-text:nth-child(1) { /* Size */
  margin-right: 70px;
}

.motorcycle-labels .label-text:nth-child(2) { /* Fuel */
  margin-right: 120px;
}

.label-text {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.label-text:nth-child(2) {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.add-button {
  cursor: pointer;
}

.add-button img {
  width: 30px;
  height: 30px;
  transition: transform 0.3s ease;
}

.add-button:hover img {
  transform: scale(1.1);
}

.vehicle-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.8);
}

.row-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3d7c4a;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 20px;
  font-size: 14px;
}

.size-select,
.fuel-select,
.fuel-display {
  margin-right: 20px;
}

.fuel-display {
  display: flex;
  align-items: center;
  min-width: 120px;
}

.fuel-text {
  font-size: 13px;
  color: #666;
  font-style: italic;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.custom-select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  min-width: 120px;
  color: black;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.distance-slider {
  flex: 1;
  margin-right: 20px;
}

.gradient-slider {
  width: 100%;
  height: 5px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  margin-bottom: 8px;
}

.gradient-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 20px;
  cursor: pointer;
  background: linear-gradient(to right, #fff, #81c263);
  border-radius: 10px;
  border: none;
}

.gradient-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 50px;
  height: 50px;
  background: transparent;
  cursor: pointer;
  border: none;
  border-radius: 0;
  box-shadow: none;
  background-size: 45px 45px;
  background-position: center;
  background-repeat: no-repeat;
}

/* Car slider thumb */
.car-slider::-webkit-slider-thumb {
  background-image: url('@/assets/img/sport-car.png');
  background-color: transparent;
}

/* Motorcycle slider thumb */
.motorcycle-slider::-webkit-slider-thumb {
  background-image: url('@/assets/img/motorbike.png');
  background-color: transparent;
}

/* LRT slider thumb */
.lrt-slider::-webkit-slider-thumb {
  background-image: url('@/assets/img/train.png');
  background-color: transparent;
}

/* MRT slider thumb */
.mrt-slider::-webkit-slider-thumb {
  background-image: url('@/assets/img/train.png');
  background-color: transparent;
}

/* KTM slider thumb */
.ktm-slider::-webkit-slider-thumb {
  background-image: url('@/assets/img/train.png');
  background-color: transparent;
}

/* Monorail slider thumb */
.monorail-slider::-webkit-slider-thumb {
  background-image: url('@/assets/img/train.png');
  background-color: transparent;
}

/* Bus slider thumb */
.bus-slider::-webkit-slider-thumb {
  background-image: url('@/assets/img/bus.png');
  background-color: transparent;
}

/* Firefox support */
.gradient-slider::-moz-range-thumb {
  width: 50px;
  height: 50px;
  background: transparent;
  cursor: pointer;
  border: none;
  border-radius: 0;
  box-shadow: none;
  background-size: 45px 45px;
  background-position: center;
  background-repeat: no-repeat;
}

.car-slider::-moz-range-thumb {
  background-image: url('@/assets/img/sport-car.png');
  background-color: transparent;
}

.motorcycle-slider::-moz-range-thumb {
  background-image: url('@/assets/img/motorbike.png');
  background-color: transparent;
}

.lrt-slider::-moz-range-thumb,
.mrt-slider::-moz-range-thumb,
.ktm-slider::-moz-range-thumb,
.monorail-slider::-moz-range-thumb {
  background-image: url('@/assets/img/train.png');
  background-color: transparent;
}

.bus-slider::-moz-range-thumb {
  background-image: url('@/assets/img/bus.png');
  background-color: transparent;
}

/* Hover effects */
.gradient-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.gradient-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

/* Info button styles */
.info-button {
  background: rgba(61, 124, 74, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.info-button:hover {
  background: rgba(61, 124, 74, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(61, 124, 74, 0.3);
}

.info-icon {
  font-size: 12px;
  color: white;
  font-weight: bold;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

/* Info popup styles */
.info-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.info-popup .popup-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-popup h3 {
  color: rgba(61, 124, 74, 1);
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid rgba(61, 124, 74, 0.2);
  padding-bottom: 10px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.popup-section {
  margin-bottom: 25px;
}

.popup-section h4 {
  color: rgba(61, 124, 74, 1);
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 600;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.popup-section p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.popup-close-btn {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3d7c4a, #2d5a37);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.popup-close-btn:hover {
  background: linear-gradient(135deg, #4a8c5a, #3d6a47);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 124, 74, 0.3);
}

.distance-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.distance-value {
  font-weight: 600;
  color: #3d7c4a;
}

.distance-unit {
  color: #999;
}

.delete-button {
  color: #999;
  font-size: 12px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.delete-button:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

/* 公共交通详情样式 */
.public-details {
  width: 100%;
}

.transport-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.8);
}

.transport-type {
  width: 80px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-right: 20px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}

.transport-slider {
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 25px 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(255, 255, 255, 0.8));
  border-radius: 0 0 20px 20px;
  flex-shrink: 0;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  min-width: 100px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #718096;
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.1),
    -4px -4px 8px rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.15),
    -6px -6px 12px rgba(255, 255, 255, 1);
}

.btn-primary {
  background: linear-gradient(135deg, #3d7c4a, #2d5a37);
  color: white;
  box-shadow: 
    4px 4px 8px rgba(61, 124, 74, 0.3),
    -4px -4px 8px rgba(255, 255, 255, 0.8);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #4a8c5a, #3d6a47);
  transform: translateY(-2px);
  box-shadow: 
    6px 6px 12px rgba(61, 124, 74, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 13px;
  }
}

/* Toast Notification Styles */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  animation: slideInRight 0.3s ease-out;
}

.toast-content {
  background: #fff;
  border: 2px solid #e74c3c;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 250px;
  max-width: 400px;
}

.toast-message {
  color: #e74c3c;
  font-weight: 500;
  font-size: 14px;
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.toast-close:hover {
  background-color: #f8f9fa;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .toast-notification {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .toast-content {
    min-width: auto;
    max-width: none;
  }
}
</style>
