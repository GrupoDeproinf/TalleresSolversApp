// Fotos y PDFs del registro. Las fotos se comprimen al tomarlas (1600 px,
// calidad 70 %) para que el envío sea rápido en teléfonos de gama media.
// Se guarda solo la ruta del archivo (no el base64) para poder retomar el
// borrador si la app se cierra; el base64 se arma al enviar.
import {Platform, PermissionsAndroid} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

const PHOTO_OPTIONS = {
  mediaType: 'photo',
  includeBase64: false,
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.7,
};

const fromAsset = asset =>
  asset
    ? {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'foto.jpg',
      }
    : null;

export const pedirPermisoCamara = async () => {
  if (Platform.OS !== 'android') return true;
  const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Permiso de cámara',
    message: 'Solvers necesita la cámara para fotografiar tus documentos y tu taller.',
    buttonPositive: 'Permitir',
  });
  return r === PermissionsAndroid.RESULTS.GRANTED;
};

/** source: 'camera' | 'gallery' | 'pdf'. Devuelve {uri,type,name} o null si canceló. */
export const elegirArchivo = async source => {
  if (source === 'pdf') {
    try {
      const r = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        copyTo: 'documentDirectory',
      });
      return {uri: r.fileCopyUri || r.uri, type: r.type || 'application/pdf', name: r.name || 'documento.pdf'};
    } catch (e) {
      if (DocumentPicker.isCancel(e)) return null;
      throw e;
    }
  }
  if (source === 'camera') {
    const ok = await pedirPermisoCamara();
    if (!ok) {
      const err = new Error('Sin permiso de cámara');
      err.friendly = 'Activa el permiso de cámara en Ajustes, o elige una foto de la galería.';
      throw err;
    }
    const res = await launchCamera(PHOTO_OPTIONS);
    if (res.didCancel) return null;
    if (res.errorCode) throw new Error(res.errorMessage || res.errorCode);
    return fromAsset(res.assets?.[0]);
  }
  const res = await launchImageLibrary(PHOTO_OPTIONS);
  if (res.didCancel) return null;
  if (res.errorCode) throw new Error(res.errorMessage || res.errorCode);
  return fromAsset(res.assets?.[0]);
};

/** Lee un archivo local y devuelve su base64 (sin el prefijo data:). */
export const archivoABase64 = uri =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const s = String(reader.result || '');
        const i = s.indexOf(',');
        resolve(i >= 0 ? s.slice(i + 1) : s);
      };
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = () => reject(new Error('No se pudo leer el archivo'));
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
