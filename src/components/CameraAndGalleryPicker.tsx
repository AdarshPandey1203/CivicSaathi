import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Upload,
  X,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
  Eye,
  CameraOff,
} from 'lucide-react';

interface CameraAndGalleryPickerProps {
  currentImageUrl?: string;
  onImageSelected: (imageDataUrl: string) => void;
  onImageRemoved?: () => void;
  label?: string;
  required?: boolean;
}

const CIVIC_PRESET_PHOTOS = [
  { label: 'Pothole on Road', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Garbage Overflow', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80' },
  { label: 'Water Pipe Leak', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Broken Streetlight', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80' },
  { label: 'Drainage Sewage', url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80' },
];

export const CameraAndGalleryPicker: React.FC<CameraAndGalleryPickerProps> = ({
  currentImageUrl,
  onImageSelected,
  onImageRemoved,
  label = 'Attach Latest Photo Evidence',
  required = false,
}) => {
  const [activeMode, setActiveMode] = useState<'idle' | 'gallery' | 'camera' | 'presets'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isDragging, setIsDragging] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start Camera with user constraints
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was blocked by the browser. Please allow camera permissions, or select "Choose from Gallery" below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No active camera hardware detected. Please choose a photo from your gallery.');
      } else {
        setCameraError('Unable to open live camera on this device. Please select from photo gallery.');
      }
    }
  };

  // Toggle front / rear camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current snapshot from video feed
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    stopCamera();
    setActiveMode('idle');
    onImageSelected(dataUrl);
  };

  // Cleanup on unmount or mode switch
  useEffect(() => {
    if (activeMode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode]);

  // Handle Device Gallery File Upload with Canvas Compression
  const handleFileUpload = (file: File) => {
    setSecurityError(null);

    // 1. Security Check: MIME type validation
    if (!file.type.startsWith('image/')) {
      setSecurityError('Invalid file type. Only JPEG, PNG, or WEBP images are supported.');
      return;
    }

    // 2. Security Check: File Size limit (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setSecurityError('Image file is too large (maximum 5MB allowed).');
      return;
    }

    // 3. Process & sanitize image through canvas compression
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setActiveMode('idle');
        onImageSelected(compressedDataUrl);
      };
      img.onerror = () => {
        setSecurityError('Corrupted or unreadable image file.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input for Photo Gallery upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {currentImageUrl ? (
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            Latest Photo Attached
          </span>
        ) : (
          <span className="text-[11px] text-slate-500 font-medium">
            Attach photo via Camera or Gallery
          </span>
        )}
      </div>

      {/* Security alert if validation failed */}
      {securityError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{securityError}</span>
        </div>
      )}

      {/* TWO PRIMARY PHOTO SELECTION BUTTONS: CAMERA & GALLERY */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* BUTTON 1: CAMERA (TAKE PHOTO) */}
        <button
          type="button"
          onClick={() => {
            setActiveMode(activeMode === 'camera' ? 'idle' : 'camera');
          }}
          className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
            activeMode === 'camera'
              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm'
              : 'border-slate-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/30 text-slate-800'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Take Live Photo</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Snap latest photo with camera</div>
          </div>
        </button>

        {/* BUTTON 2: GALLERY (CHOOSE FROM GALLERY) */}
        <button
          type="button"
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className="p-3 rounded-xl border-2 border-slate-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/30 text-slate-800 text-left transition-all flex items-center gap-3 cursor-pointer shadow-xs"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Choose from Gallery</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Upload latest photo from device</div>
          </div>
        </button>
      </div>

      {/* LIVE CAMERA VIEWFINDER (When Camera mode is open) */}
      {activeMode === 'camera' && (
        <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-2">
          {cameraError ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <CameraOff className="w-4 h-4 shrink-0" />
                <span>Camera Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">{cameraError}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Use Gallery Instead</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Camera header controls */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900 text-xs flex items-center gap-1 backdrop-blur-xs cursor-pointer"
                  title="Flip camera"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Flip Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveMode('idle');
                  }}
                  className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white text-xs cursor-pointer"
                  title="Close Camera"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Shutter Button */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-black shadow-xl flex items-center gap-2 border-2 border-white transition-all transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Latest Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DROP ZONE OR CURRENT PREVIEW */}
      {currentImageUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-600/40 bg-slate-900 shadow-sm group">
          <img
            src={currentImageUrl}
            alt="Report evidence"
            className="w-full h-44 object-cover"
          />

          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs text-[11px] text-white font-bold flex items-center gap-1.5 shadow-xs">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Latest Photo Attached</span>
          </div>

          {/* Action buttons on image */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between p-1 bg-slate-950/80 backdrop-blur-xs rounded-xl">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewZoom(true)}
                className="px-2.5 py-1 text-white hover:text-emerald-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-white hover:text-emerald-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Replace from Gallery</span>
              </button>
            </div>

            {onImageRemoved && (
              <button
                type="button"
                onClick={onImageRemoved}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Drag & Drop Gallery Box when no photo is attached and camera is not active */
        activeMode !== 'camera' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-emerald-600 bg-emerald-50/60'
                : 'border-slate-300 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Or drag & drop latest photo here, or click to browse files</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Supports JPEG, PNG, WEBP (auto-compressed up to 5MB)
            </div>
          </div>
        )
      )}

      {/* CIVIC QUICK SAMPLE PRESETS COLLAPSIBLE */}
      <div className="pt-1">
        <details className="group">
          <summary className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1 list-none">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Don't have a photo? Select from realistic civic samples</span>
          </summary>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 pt-2 border-t border-slate-100">
            {CIVIC_PRESET_PHOTOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveMode('idle');
                  onImageSelected(preset.url);
                }}
                className="p-1 rounded-xl border border-slate-200 hover:border-emerald-600 bg-white text-left transition-all hover:shadow-xs group cursor-pointer"
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-11 object-cover rounded-lg mb-1"
                />
                <span className="text-[10px] font-semibold text-slate-700 truncate block group-hover:text-emerald-800">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* FULLSCREEN INSPECT MODAL */}
      {previewZoom && currentImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800">Latest Photo Full View</h4>
              <button
                type="button"
                onClick={() => setPreviewZoom(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={currentImageUrl}
              alt="Full preview"
              className="w-full max-h-[70vh] object-contain rounded-xl bg-slate-900"
            />
          </div>
        </div>
      )}
    </div>
  );
};
