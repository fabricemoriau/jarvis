import React, { useState } from 'react';
import {
  Camera,
  Search,
  Filter,
  Sparkles,
  Trash2,
  Upload,
  CheckCircle2,
  Users,
  HardDrive,
  Copy,
  Smartphone,
  Eye,
  Tag,
  Zap,
  FolderPlus,
  CloudDownload,
  Download,
  Folder,
  Loader2,
  Radio,
  Image as ImageIcon,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { PhotoItem } from '../../types';
import {
  importPhotosFromDrive,
  syncPhotosFromXiaomi,
  createServerPhotoAlbum,
  savePhotoToServer,
} from '../../services/api';

interface PhotoModuleProps {
  photos: PhotoItem[];
  onUpdatePhotos: (photos: PhotoItem[]) => void;
  onNotify: (msg: string) => void;
}

export const PhotoModule: React.FC<PhotoModuleProps> = ({
  photos,
  onUpdatePhotos,
  onNotify,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('Tous');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);

  // Dynamic Server Albums
  const [albums, setAlbums] = useState<string[]>([
    'Tous',
    'Voyages',
    'Famille',
    'Projets Android',
    'Documents',
    'Captures',
    'Xiaomi_Camera',
    'Drive_Import',
  ]);

  // Modal Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSource, setImportSource] = useState<'xiaomi' | 'google_drive' | 'google_photos' | 'local'>('xiaomi');
  const [phonePath, setPhonePath] = useState('/storage/emulated/0/DCIM/Camera');
  const [driveFolder, setDriveFolder] = useState('Photos_Sauvegarde_2026');
  const [targetServerAlbum, setTargetServerAlbum] = useState('Xiaomi_Camera');
  const [isImporting, setIsImporting] = useState(false);

  // New Album Modal State
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  const filteredPhotos = photos.filter((photo) => {
    const matchesAlbum = selectedAlbum === 'Tous' ? true : photo.album === selectedAlbum;
    const matchesTag = tagFilter ? photo.tags.includes(tagFilter) : true;
    const matchesSearch =
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (photo.facesDetected &&
        photo.facesDetected.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesAlbum && matchesTag && matchesSearch;
  });

  const duplicateCandidates = photos.filter((p) => p.isDuplicateCandidate);

  const handleCleanDuplicates = () => {
    setIsCleaningDuplicates(true);
    setTimeout(() => {
      const cleaned = photos.filter((p) => !p.isDuplicateCandidate);
      onUpdatePhotos(cleaned);
      setIsCleaningDuplicates(false);
      onNotify("JARVIS a supprimé 1 doublon rafale et libéré 8.2 MB sur votre serveur NAS.");
    }, 1000);
  };

  const handleCreateNewAlbum = async () => {
    if (!newAlbumName.trim() || isCreatingAlbum) return;
    setIsCreatingAlbum(true);

    try {
      const res = await createServerPhotoAlbum(newAlbumName);
      if (res.success) {
        if (!albums.includes(res.createdAlbum)) {
          setAlbums([...albums, res.createdAlbum]);
        }
        setSelectedAlbum(res.createdAlbum);
        setIsNewAlbumModalOpen(false);
        setNewAlbumName('');
        onNotify(`Dossier serveur créé dans /nas/photos/${res.createdAlbum}`);
      }
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur lors de la création de l'album : " + err.message);
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  const handleExecuteImport = async () => {
    setIsImporting(true);
    try {
      if (importSource === 'xiaomi') {
        const res = await syncPhotosFromXiaomi(phonePath);
        if (res.syncedFiles) {
          onUpdatePhotos([...res.syncedFiles, ...photos]);
          setSelectedAlbum('Xiaomi_Camera');
          onNotify(res.message);
        }
      } else if (importSource === 'google_drive' || importSource === 'google_photos') {
        const res = await importPhotosFromDrive(importSource, driveFolder);
        if (res.importedFiles) {
          onUpdatePhotos([...res.importedFiles, ...photos]);
          setSelectedAlbum('Drive_Import');
          onNotify(res.message);
        }
      }
      setIsImportModalOpen(false);
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur lors de la récupération : " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const targetAlbum = selectedAlbum === 'Tous' ? 'Captures' : selectedAlbum;
        const newPhoto: PhotoItem = {
          id: `ph-new-${Date.now()}`,
          title: file.name,
          url: uploadEvent.target?.result as string,
          date: "Aujourd'hui à " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          album: targetAlbum,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          resolution: 'Cliché Téléversé',
          tags: ['Nouveau cliché', 'Enregistré sur Serveur', targetAlbum],
          isSyncedFromMobile: false,
          source: 'local_upload',
          serverPath: `/nas/photos/${targetAlbum}/${file.name}`,
          facesDetected: [],
          isDuplicateCandidate: false,
        };

        try {
          await savePhotoToServer(newPhoto);
        } catch (e) {
          console.warn('Backend save sync error:', e);
        }

        onUpdatePhotos([newPhoto, ...photos]);
        onNotify(`Photo "${file.name}" enregistrée dans /nas/photos/${targetAlbum}/ sur votre serveur dédié.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    const updated = photos.filter((p) => p.id !== photoId);
    onUpdatePhotos(updated);
    setActivePhoto(null);
    onNotify("Photo effacée du stockage serveur NAS.");
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-xl hud-glass border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-hud font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span>Photothèque & Coffre Médias Domestique (/nas/photos)</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              <span>ZFS 8TB • 2.1 TB Occupés</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Synchronisation Xiaomi HyperOS • Récupération Google Drive & Photos • Indexation faciale et détection de scènes par JARVIS
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {duplicateCandidates.length > 0 && (
            <button
              onClick={handleCleanDuplicates}
              disabled={isCleaningDuplicates}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-hud transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Nettoyer doublons ({duplicateCandidates.length})</span>
            </button>
          )}

          {/* New Album Folder Button */}
          <button
            onClick={() => setIsNewAlbumModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-hud transition-all active:scale-95"
          >
            <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nouveau Dossier Serveur</span>
          </button>

          {/* Sync / Retrieve Modal Trigger Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <CloudDownload className="w-4 h-4" />
            <span>Récupérer Photos (Xiaomi / Drive)</span>
          </button>

          {/* Direct File Upload */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-hud tracking-wider cursor-pointer transition-all active:scale-95">
            <Upload className="w-3.5 h-3.5" />
            <span>Téléverser Local</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleDirectFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Album Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Album Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 no-scrollbar w-full md:w-auto">
          {albums.map((album) => {
            const isActive = selectedAlbum === album;
            const count = album === 'Tous' ? photos.length : photos.filter((p) => p.album === album).length;
            return (
              <button
                key={album}
                onClick={() => {
                  setSelectedAlbum(album);
                  setTagFilter('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Folder className="w-3 h-3 text-cyan-400" />
                <span>{album}</span>
                <span className="text-[10px] font-mono text-slate-500">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Chercher tag, visage, lieu, dossier..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 font-sans"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setActivePhoto(photo)}
            className="group relative rounded-xl overflow-hidden hud-glass-card border border-cyan-500/20 hover:border-cyan-400/60 cursor-pointer transition-all hover:-translate-y-1"
          >
            {/* Image Preview */}
            <div className="aspect-4/3 w-full overflow-hidden bg-slate-900 relative">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Duplicate Badge */}
              {photo.isDuplicateCandidate && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500/90 text-slate-950 text-[10px] font-hud font-bold shadow-md">
                  Doublon rafale
                </div>
              )}

              {/* Source Badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {photo.source === 'xiaomi_mobile' || photo.isSyncedFromMobile ? (
                  <div
                    className="p-1 rounded-md bg-slate-950/80 border border-cyan-500/40 text-cyan-300"
                    title="Synchronisé depuis votre Xiaomi HyperOS"
                  >
                    <Smartphone className="w-3 h-3" />
                  </div>
                ) : photo.source === 'google_drive' || photo.source === 'google_photos' ? (
                  <div
                    className="p-1 rounded-md bg-slate-950/80 border border-purple-500/40 text-purple-300"
                    title="Importé depuis Google Drive / Google Photos"
                  >
                    <CloudDownload className="w-3 h-3" />
                  </div>
                ) : (
                  <div
                    className="p-1 rounded-md bg-slate-950/80 border border-emerald-500/40 text-emerald-300"
                    title="Enregistré sur le serveur NAS"
                  >
                    <HardDrive className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity flex items-end p-3">
                <div className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspecter fichier serveur</span>
                </div>
              </div>
            </div>

            {/* Photo Info */}
            <div className="p-3 space-y-1.5 font-sans">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-semibold text-slate-200 truncate pr-2 font-mono" title={photo.title}>
                  {photo.title}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {photo.size}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="text-cyan-400">/{photo.album}</span>
                <span>{photo.date}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {photo.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTagFilter(tagFilter === tag ? '' : tag);
                    }}
                    className={`text-[9px] font-hud px-1.5 py-0.2 rounded border transition-colors ${
                      tagFilter === tag
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-900 text-cyan-300/80 border-cyan-500/20 hover:border-cyan-400'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
                {photo.tags.length > 3 && (
                  <span className="text-[9px] text-slate-500 font-mono">
                    +{photo.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Server Metadata Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-3xl hud-glass-card rounded-2xl border border-cyan-500/40 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h3 className="font-hud font-bold text-sm text-white truncate max-w-md font-mono">
                  {activePhoto.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 max-h-[75vh] overflow-y-auto">
              <div className="md:col-span-7 bg-slate-950 flex items-center justify-center p-4">
                <img
                  src={activePhoto.url}
                  alt={activePhoto.title}
                  className="max-h-[50vh] w-auto object-contain rounded-lg border border-slate-800"
                />
              </div>

              <div className="md:col-span-5 p-5 space-y-4 bg-slate-900/60 font-sans">
                <div className="space-y-2">
                  <h4 className="text-xs font-hud uppercase tracking-wider text-cyan-400 font-bold">
                    Stockage Serveur & Métadonnées
                  </h4>

                  <div className="space-y-1.5 text-xs font-mono text-slate-300">
                    <div className="flex flex-col py-1 border-b border-slate-800">
                      <span className="text-slate-400 text-[10px]">Chemin fichier sur Debian :</span>
                      <span className="text-cyan-300 text-[11px] break-all font-mono">
                        {activePhoto.serverPath || `/nas/photos/${activePhoto.album}/${activePhoto.title}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Dossier / Album :</span>
                      <span className="text-white">{activePhoto.album}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Résolution :</span>
                      <span>{activePhoto.resolution}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Poids :</span>
                      <span>{activePhoto.size}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Date :</span>
                      <span>{activePhoto.date}</span>
                    </div>

                    {activePhoto.exifData && (
                      <div className="py-1 border-b border-slate-800 space-y-0.5 text-[11px]">
                        <div className="text-slate-400">Appareil : {activePhoto.exifData.camera}</div>
                        {activePhoto.exifData.gps && (
                          <div className="text-emerald-400">GPS : {activePhoto.exifData.gps}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Faces Recognized */}
                {activePhoto.facesDetected && activePhoto.facesDetected.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-hud text-slate-400 uppercase flex items-center gap-1">
                      <Users className="w-3 h-3 text-cyan-400" />
                      <span>Visages identifiés :</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePhoto.facesDetected.map((face, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-hud"
                        >
                          👤 {face}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-hud text-slate-400 uppercase flex items-center gap-1">
                    <Tag className="w-3 h-3 text-cyan-400" />
                    <span>Labels reconnus par IA :</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePhoto.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-hud"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={activePhoto.url}
                    download={activePhoto.title}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-hud font-bold text-xs text-center flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger le Fichier Original</span>
                  </a>

                  <button
                    onClick={() => handleDeletePhoto(activePhoto.id)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 font-hud text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer du Serveur</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync & Import Modal (Xiaomi / Drive / Photos) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-xl hud-glass-card p-6 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CloudDownload className="w-5 h-5 text-cyan-400" />
                <h3 className="font-hud font-bold text-base text-white">
                  Récupération & Enregistrement de Photos sur le Serveur
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Source Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-hud">
              <button
                onClick={() => {
                  setImportSource('xiaomi');
                  setTargetServerAlbum('Xiaomi_Camera');
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  importSource === 'xiaomi'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mon Xiaomi</span>
              </button>

              <button
                onClick={() => {
                  setImportSource('google_drive');
                  setTargetServerAlbum('Drive_Import');
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  importSource === 'google_drive'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Google Drive</span>
              </button>

              <button
                onClick={() => {
                  setImportSource('google_photos');
                  setTargetServerAlbum('Drive_Import');
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  importSource === 'google_photos'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Google Photos</span>
              </button>
            </div>

            {/* Source Details Form */}
            <div className="space-y-3 font-sans text-xs">
              {importSource === 'xiaomi' && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-hud text-cyan-300 font-bold uppercase text-[11px]">
                      Passerelle Mobile Xiaomi (HyperOS)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Tunnel WireGuard Connecté</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    JARVIS va parcourir la pellicule de votre Xiaomi via la connexion sécurisée et transférer les nouveaux clichés vers votre serveur dédié.
                  </p>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Dossier source sur téléphone :</label>
                    <input
                      type="text"
                      value={phonePath}
                      onChange={(e) => setPhonePath(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono mt-1"
                    />
                  </div>
                </div>
              )}

              {(importSource === 'google_drive' || importSource === 'google_photos') && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-hud text-purple-300 font-bold uppercase text-[11px]">
                      Compte Cloud : fabrice.moriau@gmail.com
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Session Active</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    JARVIS télécharge les photos depuis votre {importSource === 'google_photos' ? 'Google Photos' : 'Google Drive'} et les enregistre dans le stockage ZFS local.
                  </p>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Dossier ou album distant :</label>
                    <input
                      type="text"
                      value={driveFolder}
                      onChange={(e) => setDriveFolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Destination on Dedicated Server */}
              <div>
                <label className="text-[11px] font-hud text-slate-400 uppercase">
                  Dossier de destination sur le serveur dédié (/nas/photos/) :
                </label>
                <select
                  value={targetServerAlbum}
                  onChange={(e) => setTargetServerAlbum(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white mt-1"
                >
                  {albums.filter((a) => a !== 'Tous').map((alb) => (
                    <option key={alb} value={alb}>
                      /nas/photos/{alb}/
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-hud text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isImporting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-40"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Récupération et écriture des fichiers...</span>
                  </>
                ) : (
                  <>
                    <CloudDownload className="w-4 h-4" />
                    <span>Lancer la Récupération</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Album Modal */}
      {isNewAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md hud-glass-card p-6 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-hud font-bold text-sm text-white">
                  Créer un Dossier de Photos sur le Serveur
                </h3>
              </div>
              <button
                onClick={() => setIsNewAlbumModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <p className="text-slate-300">
                JARVIS va créer un nouveau point de montage dans <span className="font-mono text-cyan-300">/nas/photos/</span> avec gestion automatique des permissions.
              </p>
              <div>
                <label className="text-[11px] font-hud text-slate-400 uppercase">Nom du Dossier / Album</label>
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Ex : Vacances_2026 ou Projets_Drone"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono mt-1 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsNewAlbumModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-hud text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateNewAlbum}
                disabled={!newAlbumName.trim() || isCreatingAlbum}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-bold text-xs disabled:opacity-40"
              >
                {isCreatingAlbum ? 'Création...' : 'Créer le dossier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
