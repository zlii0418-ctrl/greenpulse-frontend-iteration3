<template>
    <div class="page flex-col">
      <div class="main-container">
        <div class="block_1 flex-col justify-end">
          <div class="group_1 flex-row">
            <div class="car-header-container">
              <button class="info-button" onclick="showCarPopup()" title="Car Information">
                <span class="info-icon">i</span>
              </button>
              <img
                class="label_2"
                referrerpolicy="no-referrer"
                :src="sportCarIcon"
              />
            </div>
              <span class="text_1">Size</span> <span class="text_2">Fuel</span>
            <span class="text_3">Distance</span>
            <div class="section_1 flex-col">
              <div>
                <img id="g2AddRow" style="width: 38px;height: 38px;" :src="addIcon">
              </div>
            </div>
          </div>
          <div class="group_2 flex-row">
            <div class="text-wrapper_1 flex-col">
              <span class="text_4">1</span>
            </div>
            <div class="group_3 flex-col justify-between">
              <div class="image-wrapper_2 flex-col">
                <div class="select-container">
                    <select class="custom-select" id="sizeSelect1">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
              </div>
              <div class="box_2 flex-col"></div>
            </div>
            <div class="image-wrapper_3 flex-col">
              <div class="select-container">
                  <select class="custom-select" id="fuelSelect1">
                      <option value="diesel">Diesel</option>
                      <option value="petrol" selected>Petrol</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="phev">Plug-in Hybrid Electric Vehicle</option>
                      <option value="bev">Battery Electric Vehicle</option>
                  </select>
              </div>
            </div>
            <div class=" group_4 flex-col justify-between small-slider">
              <div class="block_2 flex-col">
                <input 
                      type="range" 
                      class="mySlider1 gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      row="1"
                  >
              </div>
              <div class="text-wrapper_2 flex-row justify-between">
                <span class="text_5">0</span>
                <span class="text_6">unit: km</span>
              </div>
            </div>
            <div class="group2-delete" row="1" style="color: white;font-size: 12px;cursor: pointer;">Delete</div>
          </div>
          <div class="group_2 flex-row">
            <div class="text-wrapper_3 flex-col">
              <span class="text_4">2</span>
            </div>
            <div class="image-wrapper_4 flex-col">
              <div class="select-container">
                    <select class="custom-select" id="sizeSelect2">
                        <option value="small">small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
            <div class="image-wrapper_5 flex-col">
              <div class="select-container">
                  <select class="custom-select" id="fuelSelect2">
                      <option value="diesel">Diesel</option>
                      <option value="petrol" selected>Petrol</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="phev">Plug-in Hybrid Electric Vehicle</option>
                      <option value="bev">Battery Electric Vehicle</option>
                  </select>
              </div>
            </div>
            <div class="box_3 flex-col justify-between small-slider">
              <div class="block_3 flex-col">
                <input 
                      type="range" 
                      class="mySlider1 gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      row="2"
                  >
              </div>
              <div class="text-wrapper_4 flex-row justify-between">
                <span class="text_5">0</span>
                <span class="text_9">unit: km</span>
              </div>
            </div>
            <div class="group2-delete" row="2" style="color: white;font-size: 12px;cursor: pointer;">Delete</div>
          </div>
          <div class="group_2 flex-row">
            <div class="text-wrapper_5 flex-col">
              <span class="text_4">3</span>
            </div>
            <div class="image-wrapper_6 flex-col">
              <div class="select-container">
                    <select class="custom-select" id="sizeSelect3">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
            <div class="image-wrapper_7 flex-col">
              <div class="select-container">
                  <select class="custom-select" id="fuelSelect3">
                      <option value="diesel">Diesel</option>
                      <option value="petrol" selected>Petrol</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="phev">Plug-in Hybrid Electric Vehicle</option>
                      <option value="bev">Battery Electric Vehicle</option>
                  </select>
              </div>
            </div>
            <div class="group_7 flex-col justify-between small-slider">
              <div class="group_8 flex-col">
                <input 
                      type="range" 
                      class="mySlider1 gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      row="3"
                  >
              </div>
              <div class="group_9 flex-row">
                <span class="text_5">0</span>
                <div class="section_2 flex-col"></div>
                <span class="text_12">unit: km</span>
              </div>
            </div>
            <div class="group2-delete" row="3" style="color: white;font-size: 12px;cursor: pointer;">Delete</div>
          </div>
          
        </div>
        <div class="block_4 flex-col">
          <div class="section_3 flex-row">
            <div class="motorcycle-header-container">
              <button class="info-button" onclick="showMotorcyclePopup()" title="Motorcycle Information">
                <span class="info-icon">i</span>
              </button>
              <img
                class="image_1"
                referrerpolicy="no-referrer"
                :src="motorbikeIcon"
                draggable="false"
              />
            </div>
            <span class="text_13">Size</span>
            <div class="group_11 flex-col justify-between">
              <div class="group_12 flex-col"></div>
              <span class="text_14">Distance</span>
            </div>
            <div class="group_13 flex-col"></div>
            <div class="group_14 flex-col">
              <div>
                <img id="section4AddRow" style="width: 38px;height: 38px;" :src="addIcon" draggable="false">
              </div>
            </div>
          </div>
          <div class="section_4 flex-row">
            <div class="text-wrapper_6 flex-col">
              <span class="text_15">1</span>
            </div>
            <div class="image-wrapper_8 flex-col">
              <div class="select-container">
                    <select class="custom-select" id="sizeSelectMotor1">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
            <div class="section_5 flex-col justify-between big-slider">
              <div class="section_6 flex-col">
                <input 
                      type="range" 
                      class="mySlider2 gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      row="1"
                  >
              </div>
              <div class="text-wrapper_7 flex-row justify-between">
                <span class="text_16">0</span>
                <span class="text_17">unit: km</span>
              </div>
            </div>
            <div class="section4-delete" row="1" style="color: white;font-size: 12px;cursor: pointer;">Delete</div>
          </div>
          <div class="section_4 flex-row">
            <div class="text-wrapper_8 flex-col">
              <span class="text_15">2</span>
            </div>
            <div class="image-wrapper_9 flex-col">
              <div class="select-container">
                    <select class="custom-select" id="sizeSelectMotor2">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
            <div class="group_15 flex-col justify-between big-slider">
              <div class="group_16 flex-col">
                  <input 
                      type="range" 
                      class="mySlider2 gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      row="2"
                  >
              </div>
              <div class="text-wrapper_9 flex-row justify-between">
                <span class="text_16">0</span>
                <span class="text_20">unit: km</span>
              </div>
            </div>
            <div class="section4-delete" row="1" style="color: white;font-size: 12px;cursor: pointer;">Delete</div>
          </div>

        </div>
        <div class="popup-buttons">
          <div class="cancel-button">
            <RouterLink to="/travel-private">Cancel</RouterLink>
          </div>  
          <div class="submit-button">
            <RouterLink to="/travel-result" @click="handleSubmit">Submit</RouterLink>
          </div>
        </div>
        
        <!-- Popup for row limit -->
        <div id="popup" class="popup" onclick="closeRowPopupOnOutsideClick(event)">
            <div class="popup-content" onclick="event.stopPropagation()">
                <p>You can only add up to 5 rows.</p>
                <button onclick="closePopup()">OK</button>
            </div>
        </div>

        <!-- Car Information Popup -->
        <div id="carPopup" class="info-popup" onclick="closeCarPopupOnOutsideClick(event)">
            <div class="popup-content" onclick="event.stopPropagation()">
                <h3>Car Information</h3>
                <div class="popup-section">
                    <div class="dropdowns-container">
                        <div class="dropdown-group">
                            <h4>Size</h4>
                            <select id="carSizeSelect" class="popup-select" onchange="updateCarCombinedDescription()">
                                <option value="small">Small</option>
                                <option value="medium" selected>Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                        <div class="dropdown-group">
                            <h4>Fuel Type</h4>
                            <select id="carFuelSelect" class="popup-select" onchange="updateCarCombinedDescription()">
                                <option value="diesel">Diesel</option>
                                <option value="petrol" selected>Petrol</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="phev">Plug-in Hybrid Electric Vehicle</option>
                                <option value="bev">Battery Electric Vehicle</option>
                            </select>
                        </div>
                    </div>
                    <div id="carCombinedDescription" class="description">
                        <p><strong>Medium Petrol:</strong> From 1.4-litre to 2.0-litre engine</p>
                    </div>
                </div>
                <button onclick="closeCarPopup()" class="popup-close-btn">Close</button>
            </div>
        </div>

        <!-- Motorcycle Information Popup -->
        <div id="motorcyclePopup" class="info-popup" onclick="closeMotorcyclePopupOnOutsideClick(event)">
            <div class="popup-content" onclick="event.stopPropagation()">
                <h3>Motorcycle Information</h3>
                <div class="popup-section">
                    <h4>Size</h4>
                    <select id="motorcycleSizeSelect" class="popup-select" onchange="updateMotorcycleSizeDescription()">
                        <option value="small">Small</option>
                        <option value="medium" selected>Medium</option>
                        <option value="large">Large</option>
                    </select>
                    <div id="motorcycleSizeDescription" class="description">
                        <p><strong>Medium:</strong> Standard motorcycles (250-750cc) - good balance of power and efficiency</p>
                    </div>
                </div>
                <div class="popup-section">
                    <h4>Fuel</h4>
                    <div class="fuel-info">
                        <p><strong>For motorcycles, only petrol is considered</strong></p>
                        <p>Motorcycles typically use petrol fuel. Electric motorcycles are still relatively rare and are not included in this calculation.</p>
                    </div>
                </div>
                <button onclick="closeMotorcyclePopup()" class="popup-close-btn">Close</button>
            </div>
        </div>
      </div>
      
      <!-- 聊天机器人组件 -->
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import sportCarIcon from '@/assets/img/sport-car.png'
import motorbikeIcon from '@/assets/img/motorbike.png'
import addIcon from '@/assets/img/add.png'

// Safely reference possible global utilities
type MaybeCalcUtils = {
  saveSliderValues?: (key: string, value: string | number) => void;
  setSubmissionPath?: (path: string) => void;
  getSubmissionPath?: () => string;
};

const getCalculatorUtils = (): MaybeCalcUtils => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).calculatorUtils || {};
  } catch {
    return {};
  }
};

// Ensure dynamically created elements receive this component's scoped style attribute
let scopedAttrName: string | null = null;

function detectScopedAttrName(): void {
  if (scopedAttrName) return;
  const root = (document.querySelector('.main-container')
    || document.querySelector('.page')) as HTMLElement | null;
  if (!root) return;
  const name = root.getAttributeNames().find((n) => n.startsWith('data-v-'));
  scopedAttrName = name || null;
}

function applyScopedAttribute(container: HTMLElement): void {
  if (!scopedAttrName) detectScopedAttrName();
  if (!scopedAttrName) return;
  const setAttr = (el: Element) => el.setAttribute(scopedAttrName as string, '');
  setAttr(container);
  container.querySelectorAll('*').forEach(setAttr);
}

function goBack(): void {
  window.history.back();
}

function handleSubmit(): void {
  const utils = getCalculatorUtils();
  utils.setSubmissionPath?.('private_detailed');
}
function showPopup(message?: string): void {
  const popup = document.getElementById('popup');
  if (popup) {
    const msgEl = popup.querySelector('p');
    if (msgEl && message) msgEl.textContent = message;
    popup.style.display = 'flex';
  }
}

function closePopup(): void {
  const popup = document.getElementById('popup');
  if (popup) popup.style.display = 'none';
}

function showCarPopup(): void {
  const popup = document.getElementById('carPopup');
  if (popup) popup.style.display = 'flex';
}

function closeCarPopup(): void {
  const popup = document.getElementById('carPopup');
  if (popup) popup.style.display = 'none';
}

function showMotorcyclePopup(): void {
  const popup = document.getElementById('motorcyclePopup');
  if (popup) popup.style.display = 'flex';
}

function closeMotorcyclePopup(): void {
  const popup = document.getElementById('motorcyclePopup');
  if (popup) popup.style.display = 'none';
}

function closeCarPopupOnOutsideClick(event: Event): void {
  // Only close if the click is on the popup background (not the content)
  if (event.target === event.currentTarget) {
    closeCarPopup();
  }
}

function closeMotorcyclePopupOnOutsideClick(event: Event): void {
  // Only close if the click is on the popup background (not the content)
  if (event.target === event.currentTarget) {
    closeMotorcyclePopup();
  }
}

function closeRowPopupOnOutsideClick(event: Event): void {
  // Only close if the click is on the popup background (not the content)
  if (event.target === event.currentTarget) {
    closePopup();
  }
}

function updateCarCombinedDescription(): void {
  const sizeSelect = document.getElementById('carSizeSelect') as HTMLSelectElement;
  const fuelSelect = document.getElementById('carFuelSelect') as HTMLSelectElement;
  const description = document.getElementById('carCombinedDescription');
  
  if (!sizeSelect || !fuelSelect || !description) return;
  
  const size = sizeSelect.value;
  const fuel = fuelSelect.value;
  
  const combinedDescriptions: Record<string, Record<string, string>> = {
    small: {
      diesel: '<p><strong>Small Diesel:</strong> Up to a 1.7-litre engine</p>',
      petrol: '<p><strong>Small Petrol:</strong> Up to a 1.4-litre engine</p>',
      hybrid: '<p><strong>Small Hybrid:</strong> Vehicle models of a similar size to market segment A or B (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>',
      phev: '<p><strong>Small PHEV:</strong> Vehicle models of a similar size to market segment A or B (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>',
      bev: '<p><strong>Small BEV:</strong> Vehicle models of a similar size to market segment A or B (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>'
    },
    medium: {
      diesel: '<p><strong>Medium Diesel:</strong> From 1.7-litre to 2.0-litre engine</p>',
      petrol: '<p><strong>Medium Petrol:</strong> From 1.4-litre to 2.0-litre engine</p>',
      hybrid: '<p><strong>Medium Hybrid:</strong> Vehicle models of a similar size to market segment C (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>',
      phev: '<p><strong>Medium PHEV:</strong> Vehicle models of a similar size to market segment C (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>',
      bev: '<p><strong>Medium BEV:</strong> Vehicle models of a similar size to market segment C (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>'
    },
    large: {
      diesel: '<p><strong>Large Diesel:</strong> 2.0-litre engine and above</p>',
      petrol: '<p><strong>Large Petrol:</strong> 2.0-litre engine and above</p>',
      hybrid: '<p><strong>Large Hybrid:</strong> Vehicle models of a similar size to market segment D (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>',
      phev: '<p><strong>Large PHEV:</strong> Vehicle models of a similar size to market segment D (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>',
      bev: '<p><strong>Large BEV:</strong> Vehicle models of a similar size to market segment D (<a href="https://en.wikipedia.org/wiki/Car_classification" target="_blank">Car Classification</a>)</p>'
    }
  };
  
  const descriptionText = combinedDescriptions[size]?.[fuel] || '';
  description.innerHTML = descriptionText;
}

function updateMotorcycleSizeDescription(): void {
  const select = document.getElementById('motorcycleSizeSelect') as HTMLSelectElement;
  const description = document.getElementById('motorcycleSizeDescription');
  
  if (!select || !description) return;
  
  const sizeDescriptions = {
    small: '<p><strong>Small:</strong> Mopeds/scooters up to 125cc - very fuel efficient</p>',
    medium: '<p><strong>Medium:</strong> Standard motorcycles (125-500cc) - good balance of power and efficiency</p>',
    large: '<p><strong>Large:</strong> Large motorcycles and touring bikes (500cc+) - higher fuel consumption</p>'
  };
  
  description.innerHTML = sizeDescriptions[select.value as keyof typeof sizeDescriptions] || '';
}
function g2AddRow(): void {
  const maxRows = 5;
  const currentRows = document.querySelectorAll('.group_2').length;

  if (currentRows >= maxRows) {
    showPopup(`You can only add up to ${maxRows} rows.`);
    return;
  }

  const row = currentRows + 1;
  const group2 = document.createElement('div');
  group2.className = 'group_2 flex-row';
  const html = `<div class="text-wrapper_3 flex-col">
            <span class="text_4">${row}</span>
          </div>
          <div class="image-wrapper_4 flex-col">
             <div class="select-container">
                  <select class="custom-select" id="sizeSelect${row}">
                      <option value="small">Small</option>
                      <option value="medium" selected>Medium</option>
                      <option value="large">Large</option>
                  </select>
              </div>
          </div>
          <div class="image-wrapper_5 flex-col">
             <div class="select-container">
                <select class="custom-select" id="fuelSelect${row}">
                    <option value="diesel">Diesel</option>
                    <option value="petrol" selected>Petrol</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="phev">Plug-in Hybrid Electric Vehicle</option>
                    <option value="bev">Battery Electric Vehicle</option>
                </select>
            </div>
          </div>
          <div class="box_3 flex-col justify-between small-slider">
            <div class="block_3 flex-col">
               <input 
                    type="range" 
                    class="mySlider1 gradient-slider" 
                    min="0" 
                    max="800" 
                    value="0" 
                    step="1"
                    row="${row}"
                >
            </div>
            <div class="text-wrapper_4 flex-row justify-between">
              <span class="text_5">0</span>
              <span class="text_9">unit: km</span>
            </div>
          </div>
          <div class="group2-delete" row="${row}" style="color: white;font-size: 12px;cursor: pointer;">Delete</div>`;
  group2.innerHTML = html;
  // Ensure scoped styles apply to dynamically created nodes by copying the component's data-v-* attribute
  applyScopedAttribute(group2);
  const block1 = document.querySelector('.block_1');
  if (block1) block1.appendChild(group2);
}

function addSlider1Events(): void {
  const slider1List = document.querySelectorAll<HTMLInputElement>('.mySlider1');
  slider1List.forEach((slider) => {
    // Avoid duplicate listeners by cloning node if needed (optional)
    slider.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const currentValue = target.value;
      const index = parseInt(target.getAttribute('row') || '1', 10) - 1;

      const groups = document.querySelectorAll('.group_2');
      const group = groups[index] as HTMLElement | undefined;
      const numberElement = group?.querySelector<HTMLElement>('.text_5');
      if (numberElement) {
        numberElement.textContent = currentValue;
        numberElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
          numberElement.style.transform = 'scale(1)';
        }, 200);
      }
    });

    slider.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const finalValue = target.value;
      const rowNum = parseInt(target.getAttribute('row') || '1', 10);
      const sizeSelect = document.getElementById(`sizeSelect${rowNum}`) as HTMLSelectElement | null;
      const fuelSelect = document.getElementById(`fuelSelect${rowNum}`) as HTMLSelectElement | null;

      if (sizeSelect && fuelSelect) {
        const utils = getCalculatorUtils();
        utils.saveSliderValues?.(`car_distance_${rowNum}`, finalValue);
        localStorage.setItem(`car_size_${rowNum}`, sizeSelect.value);
        localStorage.setItem(`car_fuel_${rowNum}`, fuelSelect.value);
      }
    });
  });
}

function deleteGroup2Events(): void {
  const groupDelList = document.querySelectorAll<HTMLElement>('.group2-delete');
  groupDelList.forEach((btn) => {
    btn.onclick = (event: MouseEvent) => {
      const groups = document.querySelectorAll('.group_2');
      if (groups.length <= 1) {
        showPopup('At least one car row is required');
        return;
      }
      const target = event.target as HTMLElement;
      const child = target.closest('.group_2') as HTMLElement | null;
      const parent = child?.parentNode;
      if (child && parent) {
        parent.removeChild(child);
        renumberGroup2Rows();
      }
    };
  });
}

function renumberGroup2Rows(): void {
  const groups = document.querySelectorAll<HTMLElement>('.group_2');
  groups.forEach((group, i) => {
    const index = i + 1;
    const numEl = group.querySelector<HTMLElement>('.text_4');
    if (numEl) numEl.textContent = String(index);

    const sizeSelect = group.querySelector<HTMLSelectElement>('#' + CSS.escape(`sizeSelect${index}`))
      || group.querySelector<HTMLSelectElement>('[id^="sizeSelect"]');
    const fuelSelect = group.querySelector<HTMLSelectElement>('#' + CSS.escape(`fuelSelect${index}`))
      || group.querySelector<HTMLSelectElement>('[id^="fuelSelect"]');

    if (sizeSelect) sizeSelect.id = `sizeSelect${index}`;
    if (fuelSelect) fuelSelect.id = `fuelSelect${index}`;

    const slider = group.querySelector<HTMLInputElement>('.mySlider1');
    if (slider) slider.setAttribute('row', String(index));

    const del = group.querySelector<HTMLElement>('.group2-delete');
    if (del) del.setAttribute('row', String(index));
  });
}

function section4AddRow(): void {
  const maxMotorRows = 5;
  const currentRows = document.querySelectorAll('.section_4').length;

  if (currentRows >= maxMotorRows) {
    showPopup(`You can only add up to ${maxMotorRows} rows.`);
    return;
  }

  const row = currentRows + 1;
  const section4 = document.createElement('div');
  section4.className = 'section_4 flex-row';
  const html = `<div class="text-wrapper_8 flex-col">
            <span class="text_15">${row}</span>
          </div>
          <div class="image-wrapper_9 flex-col">
             <div class="select-container">
                  <select class="custom-select" id="sizeSelectMotor${row}">
                      <option value="small">Small</option>
                      <option value="medium" selected>Medium</option>
                      <option value="large">Large</option>
                  </select>
              </div>
          </div>
          <div class="group_15 flex-col justify-between big-slider">
            <div class="group_16 flex-col">
                <input 
                    type="range" 
                    class="mySlider2 gradient-slider" 
                    min="0" 
                    max="800" 
                    value="0" 
                    step="1"
                    row="${row}"
                >
            </div>
            <div class="text-wrapper_9 flex-row justify-between">
              <span class="text_16">0</span>
              <span class="text_20">unit: km</span>
            </div>
          </div>
          <div class="section4-delete" row="${row}" style="color: white;font-size: 12px;cursor: pointer;">Delete</div>`;
  section4.innerHTML = html;
  // Ensure scoped styles apply to dynamically created nodes by copying the component's data-v-* attribute
  applyScopedAttribute(section4);
  const block4 = document.querySelector('.block_4');
  if (block4) block4.appendChild(section4);
}

function addSlider2Events(): void {
  const slider2List = document.querySelectorAll<HTMLInputElement>('.mySlider2');
  slider2List.forEach((slider) => {
    slider.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const currentValue = target.value;
      const index = parseInt(target.getAttribute('row') || '1', 10) - 1;

      const sections = document.querySelectorAll('.section_4');
      const section = sections[index] as HTMLElement | undefined;
      const numberElement = section?.querySelector<HTMLElement>('.text_16');
      if (numberElement) {
        numberElement.textContent = currentValue;
        numberElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
          numberElement.style.transform = 'scale(1)';
        }, 200);
      }
    });

    slider.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const finalValue = target.value;
      const rowNum = parseInt(target.getAttribute('row') || '1', 10);
      const sizeSelect = document.getElementById(`sizeSelectMotor${rowNum}`) as HTMLSelectElement | null;

      if (sizeSelect) {
        const utils = getCalculatorUtils();
        utils.saveSliderValues?.(`motorcycle_distance_${rowNum}`, finalValue);
        localStorage.setItem(`motorcycle_size_${rowNum}`, sizeSelect.value);
      }
    });
  });
}

function deleteSection4Events(): void {
  const delList = document.querySelectorAll<HTMLElement>('.section4-delete');
  delList.forEach((btn) => {
    btn.onclick = (event: MouseEvent) => {
      const sections = document.querySelectorAll('.section_4');
      if (sections.length <= 1) {
        showPopup('At least one motorcycle row is required');
        return;
      }
      const target = event.target as HTMLElement;
      const child = target.closest('.section_4') as HTMLElement | null;
      const parent = child?.parentNode;
      if (child && parent) {
        parent.removeChild(child);
        renumberSection4Rows();
      }
    };
  });
}

function preventMotorcycleDrag(): void {
  const container = document.querySelector('.block_4');
  if (!container) return;
  container.addEventListener('dragstart', (e) => e.preventDefault());
}

function renumberSection4Rows(): void {
  const sections = document.querySelectorAll<HTMLElement>('.section_4');
  sections.forEach((section, i) => {
    const index = i + 1;
    const numEl = section.querySelector<HTMLElement>('.text_15');
    if (numEl) numEl.textContent = String(index);

    const sizeSelect = section.querySelector<HTMLSelectElement>('#' + CSS.escape(`sizeSelectMotor${index}`))
      || section.querySelector<HTMLSelectElement>('[id^="sizeSelectMotor"]');
    if (sizeSelect) sizeSelect.id = `sizeSelectMotor${index}`;

    const slider = section.querySelector<HTMLInputElement>('.mySlider2');
    if (slider) slider.setAttribute('row', String(index));

    const del = section.querySelector<HTMLElement>('.section4-delete');
    if (del) del.setAttribute('row', String(index));
  });
}

onMounted(() => {
  // Expose functions for inline handlers in template
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).closePopup = closePopup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).showPopup = showPopup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).goBack = goBack;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).showCarPopup = showCarPopup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).closeCarPopup = closeCarPopup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).showMotorcyclePopup = showMotorcyclePopup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).closeMotorcyclePopup = closeMotorcyclePopup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).updateCarCombinedDescription = updateCarCombinedDescription;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).updateMotorcycleSizeDescription = updateMotorcycleSizeDescription;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).closeCarPopupOnOutsideClick = closeCarPopupOnOutsideClick;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).closeMotorcyclePopupOnOutsideClick = closeMotorcyclePopupOnOutsideClick;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).closeRowPopupOnOutsideClick = closeRowPopupOnOutsideClick;

  const addRowBtn = document.getElementById('g2AddRow');
  if (addRowBtn) {
    addRowBtn.onclick = () => {
      g2AddRow();
      addSlider1Events();
      deleteGroup2Events();
      // Note: Information buttons are now used instead of dropdown click handlers
    };
  }

  const addMotorRowBtn = document.getElementById('section4AddRow');
  if (addMotorRowBtn) {
    addMotorRowBtn.onclick = () => {
      section4AddRow();
      addSlider2Events();
      deleteSection4Events();
      // Note: Information buttons are now used instead of dropdown click handlers
    };
  }

  // Initialize existing sliders/delete buttons
  addSlider1Events();
  deleteGroup2Events();
  addSlider2Events();
  deleteSection4Events();
  preventMotorcycleDrag();

  // Note: Information buttons are now used instead of dropdown click handlers
});
</script>

<style scoped>
.page {
  background-image: linear-gradient(
    90deg, 
    rgba(248, 244, 208, 1) 0, 
    rgba(226, 252, 214, 1) 100%);
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.image-wrapper_1 {
  width: 977px;
  height: 25px;
}

.label_1 {
  width: 21px;
  height: 21px;
  margin: 24px 0 0 933px;
}

.block_1 {
  width: 95%;
  max-width: 1200px;
  position: relative;
  margin: 0 auto;
  padding-bottom: 10px;
  display: flex;           /* make it flex */
  flex-direction: column;  
  align-items: center;     /* center children horizontally */
}

.group_1 {
  width: 847px;
  height: 46px;
  margin: 16px 0 0 14px;
  position: relative;
}

.label_2 {
  width: 46px;
  height: 46px;
}

.text_1 {
  width: 30px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(255, 110, 110, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 28px 0 0 70px;
  display: inline-block;
}

.text_2 {
  width: 30px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(255, 110, 110, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 28px 0 0 110px;
  display: inline-block;
}

.text_3 {
  width: 62px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(255, 110, 110, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 28px 0 0 70px;
  display: inline-block;
}

.section_1 {
  height: 28px;
  width: 27px;
  margin: 3px 0 0 217px;
}

.box_1 {
  width: 20px;
  height: 18px;
  border: 1px solid rgba(211, 155, 155, 1);
  margin: 5px 0 0 4px;
}

.group_2 {
  height: 42px;
  margin: 13px 0 0 46px;
}

.text-wrapper_1 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 28px;
  width: 27px;
}

.text_4 {
  width: 7px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 5px 0 0 10px;
}

.group_3 {
  width: 94px;
  height: 32px;
  margin: 3px 0 0 36px;
}

.image-wrapper_2 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 94px;
}

.label_3 {
  width: 23px;
  height: 23px;
  margin-left: 68px;
}

.box_2 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 3px;
  height: 3px;
  margin: 6px 0 0 21px;
}

.image-wrapper_3 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 94px;
  margin: 3px 0 0 61px;
}

.label_4 {
  width: 23px;
  height: 23px;
  margin-left: 68px;
}

.group_4 {
  width: 389px;
  height: 35px;
  margin: 7px 0 0 57px;
}

.block_2 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 322px;
  height: 12px;
  margin-left: 6px;
}

.text-wrapper_2 {
  width: 389px;
  height: 16px;
  margin-top: 7px;
}

.text_5 {
  width: 12px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_6 {
  width: 70px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.group_5 {
  width: 758px;
  height: 42px;
  margin: 16px 0 0 46px;
}

.text-wrapper_3 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 28px;
  width: 27px;
}

.text_7 {
  width: 10px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 5px 0 0 10px;
}

.image-wrapper_4 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 94px;
  margin: 3px 0 0 36px;
}

.label_5 {
  width: 23px;
  height: 23px;
  margin-left: 68px;
}

.image-wrapper_5 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 94px;
  margin: 3px 0 0 61px;
}

.label_6 {
  width: 23px;
  height: 23px;
  margin-left: 68px;
}

.box_3 {
  width: 389px;
  height: 35px;
  margin: 7px 0 0 57px;
}

.block_3 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 322px;
  height: 12px;
  margin-left: 6px;
}

.text-wrapper_4 {
  width: 389px;
  height: 16px;
  margin-top: 7px;
}

.text_8 {
  width: 12px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_9 {
  width: 70px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.group_6 {
  width: 758px;
  height: 43px;
  margin: 16px 0 0 46px;
}

.text-wrapper_5 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 28px;
  width: 27px;
}

.text_10 {
  width: 10px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 5px 0 0 10px;
}

.image-wrapper_6 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 94px;
  margin: 4px 0 0 36px;
}

.label_7 {
  width: 23px;
  height: 23px;
  margin-left: 68px;
}

.image-wrapper_7 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 94px;
  margin: 4px 0 0 61px;
}

.label_8 {
  width: 23px;
  height: 23px;
  margin-left: 68px;
}

.group_7 {
  width: 389px;
  height: 35px;
  margin: 8px 0 0 57px;
}

.group_8 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 322px;
  height: 12px;
  margin-left: 6px;
}

.group_9 {
  width: 389px;
  height: 16px;
  margin-top: 7px;
}

.text_11 {
  width: 12px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.section_2 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 4px;
  height: 4px;
  margin: 12px 0 0 68px;
}

.text_12 {
  width: 70px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
  margin-left: 235px;
}

.group_10 {
  width: 4px;
  height: 4px;
  margin: 7px 0 0 610px;
}

.box_4 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 4px;
  height: 4px;
}

.label_9 {
  position: absolute;
  left: 572px;
  top: 75px;
  width: 29px;
  height: 29px;
}

.label_10 {
  position: absolute;
  left: 572px;
  top: 133px;
  width: 29px;
  height: 29px;
}

.label_11 {
  position: absolute;
  left: 572px;
  top: 192px;
  width: 29px;
  height: 29px;
}

.block_4 {
  width: 95%;
  max-width: 1200px;
  position: relative;
  margin: 0 auto;
  padding-bottom: 10px;
  display: flex;           /* make it flex */
  flex-direction: column;  
  align-items: center;     /* center children horizontally */
  -webkit-user-drag: none;
  user-select: none;
}

.section_3 {
  width: 853px;
  height: 53px;
  margin: 12px 0 0 8px;
}

.image_1 {
  width: 58px;
  height: 53px;
}

.text_13 {
  width: 30px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(255, 110, 110, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 32px 0 0 77px;
}

.group_11 {
  width: 66px;
  height: 38px;
  margin: 12px 0 0 307px;
}

.group_12 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 4px;
  height: 4px;
  margin-left: 17px;
}

.text_14 {
  width: 66px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(255, 110, 110, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin-top: 16px;
}

.group_13 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 4px;
  height: 4px;
  margin: 36px 0 0 24px;
}

.group_14 {
  height: 27px;
  width: 27px;
  margin: 10px 0 0 260px;
}

.block_5 {
  width: 20px;
  height: 17px;
  border: 1px solid rgba(211, 155, 155, 1);
  margin: 5px 0 0 4px;
}

.section_4 {

  height: 38px;
  margin: 10px 0 0 51px;
}

.text-wrapper_6 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 28px;
  width: 27px;
}

.text_15 {
  width: 7px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 5px 0 0 10px;
}

.image-wrapper_8 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 94px;
  margin: 3px 0 0 36px;
}

.label_12 {
  width: 23px;
  height: 23px;
  margin-left: 68px;
}

.section_5 {
  width: 597px;
  height: 35px;
  margin: 3px 0 0 33px;
}

.section_6 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 493px;
  height: 12px;
  margin-left: 10px;
}

.text-wrapper_7 {
  width: 597px;
  height: 16px;
  margin-top: 7px;
}

.text_16 {
  width: 18px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_17 {
  width: 108px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.section_7 {
  width: 787px;
  height: 39px;
  margin: 19px 0 15px 51px;
}

.text-wrapper_8 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 28px;
  width: 27px;
}

.text_18 {
  width: 10px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 5px 0 0 10px;
}

.image-wrapper_9 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 94px;
  margin: 3px 0 0 36px;
}

.label_13 {
  width: 23px;
  height: 23px;
  margin-left: 68px;
}

.group_15 {
  width: 597px;
  height: 35px;
  margin: 4px 0 0 33px;
}

.group_16 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 493px;
  height: 12px;
  margin-left: 10px;
}

.text-wrapper_9 {
  width: 597px;
  height: 16px;
  margin-top: 7px;
}

.text_19 {
  width: 18px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_20 {
  width: 108px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.label_14 {
  position: absolute;
  left: 486px;
  top: 67px;
  width: 36px;
  height: 37px;
}

.label_15 {
  position: absolute;
  left: 486px;
  top: 125px;
  width: 36px;
  height: 37px;
}

/* Common styles */
.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

/* Back button styles */
.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(61, 124, 74, 0.9);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Cormorant Garamond', serif;
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-button:hover {
  background: rgba(61, 124, 74, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 124, 74, 0.3);
}

 .small-slider .gradient-slider {
      width: 100%;
      height: 15px;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      outline: none;
  }

.small-slider .gradient-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 29px;
      height: 29px;
      margin-top: -7px;
      background-image: url('@/assets/img/sport-car.png');
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 8px transparent;
      transition: all 0.2s ease;
      background-size: cover; /* background image covers the whole div */
      background-repeat: no-repeat; /* background image does not repeat */
      background-position: center; /* background image centered */
  }

 .big-slider .gradient-slider {
      width: 100%;
      height: 15px;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      outline: none;
  }

.big-slider .gradient-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 36px;
      height: 37px;
      margin-top: -7px;
      background-image: url('@/assets/img/motorbike.png');
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 8px transparent;
      transition: all 0.2s ease;
      background-size: cover; /* background image covers the whole div */
      background-repeat: no-repeat; /* background image does not repeat */
      background-position: center; /* background image centered */
  }

/* Popup background */
.popup {
  display: none; /* hidden by default */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

/* Popup box */
.popup-content {
  background: white;
  padding: 20px 30px;
  border-radius: 10px;
  text-align: center;
  font-family: 'EB Garamond', serif;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* OK button */
.popup-content button {
  margin-top: 10px;
  padding: 6px 14px;
  border: none;
  border-radius: 5px;
  background: rgba(61, 124, 74, 1);
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.popup-content button:hover {
  background: rgba(51, 104, 64, 1);
}

/* Button container */
.popup-buttons {
  display: flex;
  justify-content: center; /* center horizontally */
  gap: 20px;               /* space between buttons */
  margin-top: 20px;        /* some space above */
}

/* Shared button styles */
.cancel-button,
.submit-button {
  display: flex;
  align-items: center;   /* center text vertically */
  justify-content: center;
  width: 120px;
  height: 40px;
  border: 1px solid;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
}

.cancel-button a,
.submit-button a {
  color: inherit;          /* inherit parent color */
  text-decoration: none;   /* remove underline */
}

/* Optional hover effect */
.cancel-button a:hover,
.submit-button a:hover {
  opacity: 0.8;
}

/* Individual colors */
.cancel-button {
  color: orange; 
  border: 1px solid orange;
}

.submit-button {
  color: green;
  border: 1px solid green;
}

.main-container {
  width: 95%;
  max-height: calc(100vh - 40px);
  position: fixed;              /* Fix to viewport */
  top: 50%;                     /* Move to vertical center */
  left: 50%;                    /* Move to horizontal center */
  transform: translate(-50%, -50%); /* Center exactly */
  padding: 30px;                /* Optional spacing */
  overflow-y: auto;             /* Scroll inside if too tall */
}

/* Information Popup Styles */
.info-popup {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2000;
  justify-content: center;
  align-items: center;
}

.info-popup .popup-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  max-width: 700px;
  width: 90%;
  height: auto;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  font-family: Inter-Regular, sans-serif;
  box-shadow: 0 12px 48px rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.2);
}

.info-popup h3 {
  color: rgba(61, 124, 74, 1);
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid rgba(61, 124, 74, 0.2);
  padding-bottom: 10px;
}

.popup-section {
  margin-bottom: 35px;
}

.popup-section h4 {
  color: rgba(255, 110, 110, 1);
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: bold;
}

.dropdowns-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.dropdown-group {
  flex: 1;
}

.dropdown-group h4 {
  margin-bottom: 8px;
}

.popup-select {
  width: 100%;
  padding: 10px;
  border: 2px solid rgba(230, 227, 224, 1);
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter-Regular, sans-serif;
  background-color: white;
  margin-bottom: 15px;
  cursor: pointer;
}

.popup-select:focus {
  outline: none;
  border-color: rgba(61, 124, 74, 1);
  box-shadow: 0 0 0 3px rgba(61, 124, 74, 0.1);
}

.description {
  background-color: rgba(248, 244, 208, 0.3);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid rgba(61, 124, 74, 1);
  min-height: 80px;
}

.description p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.8);
}

.description p strong {
  color: rgba(61, 124, 74, 1);
}

.description a {
  color: rgba(61, 124, 74, 1);
  text-decoration: underline;
}

.description a:hover {
  color: rgba(51, 104, 64, 1);
}


.fuel-info {
  background-color: rgba(226, 252, 214, 0.5);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid rgba(255, 110, 110, 1);
  min-height: 80px;
}

.fuel-info p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.8);
}

.fuel-info p strong {
  color: rgba(255, 110, 110, 1);
}

.popup-close-btn {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: rgba(61, 124, 74, 1);
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-family: Inter-Regular, sans-serif;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.popup-close-btn:hover {
  background: rgba(51, 104, 64, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 124, 74, 0.3);
}

/* Information Button Styles */
.car-header-container,
.motorcycle-header-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

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
  font-size: 14px;
  color: white;
  font-weight: bold;
  line-height: 1;
}
</style>
