/**
 * CivicSaathi Pune City - Client-side Interactive Script
 * Department Category Switcher, Live WebRTC Camera, GPS Geolocation & QR Code
 */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Department -> Category Dynamic Filter in New Complaint Form
  const deptSelect = document.getElementById('department_select');
  const catSelect = document.getElementById('category_select');

  if (deptSelect && catSelect) {
    deptSelect.addEventListener('change', function () {
      const deptId = this.value;
      catSelect.innerHTML = '<option value="">-- Loading Categories --</option>';
      catSelect.disabled = true;

      if (!deptId) {
        catSelect.innerHTML = '<option value="">-- First Select a Department --</option>';
        return;
      }

      fetch(`/api/departments/${deptId}/categories`)
        .then(response => response.json())
        .then(data => {
          catSelect.innerHTML = '<option value="">-- Select Specific Complaint Category --</option>';
          data.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = `${cat.name} (Default: ${cat.default_urgency})`;
            catSelect.appendChild(opt);
          });
          catSelect.disabled = false;
        })
        .catch(err => {
          console.error('Error fetching categories:', err);
          catSelect.innerHTML = '<option value="">-- Error loading categories --</option>';
        });
    });
  }

  // 2. Geolocation / GPS Detection for Pune City
  const btnGetLocation = document.getElementById('btn-get-location');
  const latInput = document.getElementById('latitude_input');
  const lngInput = document.getElementById('longitude_input');
  const locStatus = document.getElementById('location_status');

  if (btnGetLocation) {
    btnGetLocation.addEventListener('click', function () {
      if (!navigator.geolocation) {
        if (locStatus) locStatus.textContent = 'Geolocation is not supported by your browser.';
        return;
      }

      if (locStatus) locStatus.innerHTML = '<i class="fa fa-spinner fa-spin me-1"></i> Detecting GPS coordinates...';

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          if (latInput) latInput.value = lat;
          if (lngInput) lngInput.value = lng;
          if (locStatus) {
            locStatus.innerHTML = `<span class="text-success"><i class="fa fa-check-circle me-1"></i> Location tagged: ${lat}, ${lng}</span>`;
          }
        },
        function (err) {
          console.warn('Geolocation error:', err.message);
          // Default to central Pune coordinates if blocked
          if (latInput && !latInput.value) latInput.value = '18.520430';
          if (lngInput && !lngInput.value) lngInput.value = '73.856744';
          if (locStatus) {
            locStatus.innerHTML = '<span class="text-muted"><i class="fa fa-map-pin me-1"></i> Default Pune Center (18.5204, 73.8567) set. You can refine manually.</span>';
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  // 3. WebRTC Live Camera Capture
  const btnStartCamera = document.getElementById('btn-start-camera');
  const btnCapturePhoto = document.getElementById('btn-capture-photo');
  const btnRetakePhoto = document.getElementById('btn-retake-photo');
  const cameraVideo = document.getElementById('camera-video');
  const cameraCanvas = document.getElementById('camera-canvas');
  const cameraDataInput = document.getElementById('camera_image_data');
  const cameraBox = document.getElementById('camera-modal-box');
  let stream = null;

  if (btnStartCamera && cameraVideo) {
    btnStartCamera.addEventListener('click', async function () {
      if (cameraBox) cameraBox.classList.remove('d-none');
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        cameraVideo.srcObject = stream;
        cameraVideo.play();
        cameraVideo.classList.remove('d-none');
        if (cameraCanvas) cameraCanvas.classList.add('d-none');
        if (btnCapturePhoto) btnCapturePhoto.classList.remove('d-none');
        if (btnRetakePhoto) btnRetakePhoto.classList.add('d-none');
      } catch (err) {
        alert('Could not access device camera. Please upload an image file instead.');
        console.error('Camera access error:', err);
      }
    });

    if (btnCapturePhoto) {
      btnCapturePhoto.addEventListener('click', function () {
        if (!cameraVideo || !cameraCanvas) return;
        cameraCanvas.width = cameraVideo.videoWidth || 640;
        cameraCanvas.height = cameraVideo.videoHeight || 480;
        const ctx = cameraCanvas.getContext('2d');
        ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        const dataUrl = cameraCanvas.toDataURL('image/jpeg', 0.85);
        if (cameraDataInput) cameraDataInput.value = dataUrl;

        // Stop video
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        cameraVideo.classList.add('d-none');
        cameraCanvas.classList.remove('d-none');
        btnCapturePhoto.classList.add('d-none');
        if (btnRetakePhoto) btnRetakePhoto.classList.remove('d-none');
      });
    }

    if (btnRetakePhoto) {
      btnRetakePhoto.addEventListener('click', function () {
        if (cameraDataInput) cameraDataInput.value = '';
        btnStartCamera.click();
      });
    }
  }

  // 4. QR Code Rendering on Acknowledgement Receipt
  const qrContainer = document.getElementById('receipt-qr-code');
  if (qrContainer) {
    const refNo = qrContainer.getAttribute('data-ref') || 'CS-PUN-2026-DEMO';
    const verifyUrl = `${window.location.origin}/track?ref=${encodeURIComponent(refNo)}`;
    
    // Use Google Chart QR API or SVG fallback
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`;
    qrImg.alt = `Verification QR Code for ${refNo}`;
    qrImg.className = 'img-thumbnail border-2';
    qrImg.style.width = '120px';
    qrImg.style.height = '120px';
    qrContainer.appendChild(qrImg);
  }
});
