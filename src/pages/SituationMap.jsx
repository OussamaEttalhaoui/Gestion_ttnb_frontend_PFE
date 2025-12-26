import React, { useState, useEffect,useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Chip,
  Divider,
  Alert 
} from "@mui/material";
import fetchWithAuth from "../utils/api";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LayersIcon from '@mui/icons-material/Layers';
import API_BASE_URL from '../utils/apiConfig'
import { Autocomplete } from "@react-google-maps/api";
import useMediaQuery from '@mui/material/useMediaQuery';

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ArabicFontBase64 from "./fonts"; 
import {  FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SchoolIcon from "@mui/icons-material/School";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import MapIcon from "@mui/icons-material/Map";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";



// Google Maps
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow, Polygon, DrawingManager } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


// Fonction de mappage de couleur pour les résultats (MODIFIÉE)
const getCategoryStyles = (category) => {
    switch (category) {
        case "green":
            // 'green' -> Bien équipée
            return { label: "Bien équipée", color: 'success' };
        case "orange":
            // 'orange' -> Moyennement équipée
            // return { label: "Moyennement équipée", color: 'warning' };
            return { label: "Équipement moyen", color: 'warning' };
        case "red":
            // 'red' -> Mal équipée
            return { label: "Mal équipée", color: 'error' };
        default:
            return { label: "Non Classifié", color: 'default' };
    }
};

const DOUARS = {
  chwiter: [
    { lat: 31.579348, lng: -7.814637 },
    { lat: 31.571707, lng: -7.825667 },
    { lat: 31.566954, lng: -7.813479 },
    { lat: 31.569842, lng: -7.804338 },
    { lat: 31.569806, lng: -7.795712 },
    { lat: 31.575290, lng: -7.796742 },
  ],

  "Douar Ait Lahmad": [
    { lat: 31.584874, lng: -7.811596 },
    { lat: 31.583210, lng: -7.814042 },
    { lat: 31.580249, lng: -7.808463 },
    { lat: 31.582187, lng: -7.806854 },
    { lat: 31.583210, lng: -7.804171 },
    { lat: 31.586793, lng: -7.807926 },
  ],

  "Douar Laadem": [
    { lat: 31.582165, lng: -7.850451 },
    { lat: 31.579498, lng: -7.850297 },
    { lat: 31.579645, lng: -7.846859 },
    { lat: 31.577633, lng: -7.847070 },
    { lat: 31.577944, lng: -7.845284 },
    { lat: 31.583081, lng: -7.846379 },
  ],

  "Oulad El Guern": [
    { lat: 31.587373, lng: -7.796039 },
    { lat: 31.585359, lng: -7.792402 },
    { lat: 31.586359, lng: -7.788558 },
    { lat: 31.588128, lng: -7.789400 },
    { lat: 31.588441, lng: -7.792437 },
  ],
};


const StatCard = ({ icon, label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      display: "flex",
      alignItems: "center",
      gap: 2,
      bgcolor: "#ffffff",
      border: "1px solid #e5e7eb",
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        bgcolor: alpha(color, 0.15),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);





export default function SituationMap() {
  const theme = useTheme();

  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [rayon, setRayon] = useState(2000);
  const [result, setResult] = useState(null);
  const [osmWaterMarkers, setOsmWaterMarkers] = useState({
    reservoirs: [],
    water_towers: [],
    wells: [],
    drinking_water_points: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [alOuidanePolygon, setAlOuidanePolygon] = useState([]);

  const [isDrawing, setIsDrawing] = useState(false); // Pour activer le dessin
  const [polygonCoords, setPolygonCoords] = useState([]); // Stocke les coordonnées tracées

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >900px 

  const mapContainerRef = useRef(null);
  const [selectedDouar, setSelectedDouar] = useState("");

  const [openZoneDialog, setOpenZoneDialog] = useState(true);
  const [selectedPolygon, setSelectedPolygon] = useState([]);
  


  const handleUseAlOuidane = () => {
    // on garde le polygone existant (déjà chargé)
    setOpenZoneDialog(false);
  };

  const handleCSVUploadFromDialog = async (e) => {
    await handleCSVUpload(e); // ta fonction EXISTANTE
    setOpenZoneDialog(false);
  };



  // --- Logique inchangée ---
  useEffect(() => {
    const fetchPolygon = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/zones/al_ouidane`);
        const data = await res.json();
        setAlOuidanePolygon(data.polygon); // [{lat, lng}, {lat, lng}, ...]
      } catch (err) {
        console.error("Erreur chargement polygone:", err);
      }
    };
    fetchPolygon();
  }, []);

  const mapRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });



useEffect(() => {
  if (!mapLoaded || !mapRef.current || alOuidanePolygon.length === 0) return;

  const bounds = new window.google.maps.LatLngBounds();
  alOuidanePolygon.forEach(p =>
    bounds.extend(new window.google.maps.LatLng(p.lat, p.lng))
  );

  mapRef.current.fitBounds(bounds);
  setMapCenter(bounds.getCenter().toJSON());
}, [alOuidanePolygon, mapLoaded]);

useEffect(() => {
  if (
    !mapLoaded ||
    !mapRef.current ||
    selectedPolygon.length === 0
  ) return;

  const bounds = new window.google.maps.LatLngBounds();

  selectedPolygon.forEach((p) => {
    bounds.extend(new window.google.maps.LatLng(p.lat, p.lng));
  });

  mapRef.current.fitBounds(bounds);
}, [selectedPolygon, mapLoaded]);




  // --- Logique inchangée ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/zones/classifier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y, rayon }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setResult(data);
      if (data.osm && data.osm.water_points) {
        setOsmWaterMarkers(data.osm.water_points || {
           reservoirs: [],
           water_towers: [],
           wells: [],
           drinking_water_points: []
         });

      }
    } catch (err) {
      setError("Erreur lors de la classification");
    }
    setLoading(false);
  };

  const translateHealthType = (type) => {
    switch (type) {
      case "hospital": return "Hôpitaux/Centres";
      case "doctor": return "Cabinets médicaux";
      default: return type;
    }
  };

  const translateSchoolType = (type) => {
    switch (type) {
      case "primary": return "Primaire";
      case "college": return "Collège";
      case "lycee": return "Lycée";
      case "maternelle": return "Maternelle";
      case "unknown": return "Inconnu";
      default: return type;
    }
  };

  // Centre initial 
  const center = result
    ? { lat: result.latitude, lng: result.longitude }
    : alOuidanePolygon.length > 0
      ? {
          lat: alOuidanePolygon.reduce((sum, p) => sum + p.lat, 0) / alOuidanePolygon.length,
          lng: alOuidanePolygon.reduce((sum, p) => sum + p.lng, 0) / alOuidanePolygon.length
        }
      : { lat: 0, lng: 0 }; // fallback

  // --- FIN Logique inchangée ---

  const categoryInfo = result ? getCategoryStyles(result.couleur) : {};

  const handlePolygonClassification = async (polygon) => {
  setLoading(true);
  setError("");
  setResult(null);

  try {
    console.log("➡️ Polygon envoyé au microservice Python :", polygon);

    const res = await fetch("https://site--zone-classification-api--dvl7b6hjp5rp.code.run/classify_polygon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        polygon: polygon.map(p => ({
          lat: p.lat,  // ⚠️ garde lat en premier
          lng: p.lng
        }))
      }),
    });

    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    const data = await res.json();

    console.log("✅ Résultat du microservice :", data);
    setResult(data);
    if (data.osm && data.osm.water_points) {
     setOsmWaterMarkers(data.osm.water_points || {
       reservoirs: [],
       water_towers: [],
       wells: [],
       drinking_water_points: []
     });

    }
  } catch (err) {
    console.error("❌ Erreur classification polygone :", err);
    setError("Erreur lors de la classification par polygone");
  }

  setLoading(false);
};



const downloadMapImage = async () => {
  if (!mapContainerRef.current) return;

  try {
    const canvas = await html2canvas(mapContainerRef.current, {
      useCORS: true,
      scale: 2
    });

    const image = canvas.toDataURL("image/png");

    // Création d’un lien de téléchargement
    const link = document.createElement("a");
    link.href = image;
    link.download = "situation_geographique_map.png";
    link.click();
  } catch (error) {
    console.error("Erreur capture map :", error);
  }
};


const generatePDF = async () => {
  if (!result) return;

  const pdf = new jsPDF("p", "mm", "a4");

// Ajouter police arabe
  pdf.addFileToVFS("ArabicFont.ttf", ArabicFontBase64);
  pdf.addFont("ArabicFont.ttf", "ArabicFont", "normal");
  pdf.setFont("ArabicFont"); // Définit la police pour le texte suivant

  let y = 10;

  // ======== 1) CAPTURE DE LA CARTE ========
  const mapElement = mapContainerRef.current;

  const canvas = await html2canvas(mapElement, {
    useCORS: true,
    scale: 2
  });

  const imgData = canvas.toDataURL("image/png");

  pdf.addImage(imgData, "PNG", 10, y, 190, 100);
  y += 110;

  // ======== 2) INFORMATIONS DE CLASSIFICATION ========
  pdf.setFontSize(14);
  pdf.text("Résultat de la classification :", 10, y);
  y += 8;

  pdf.setFontSize(12);
  pdf.text(`• Niveau : ${getCategoryStyles(result.couleur).label}`, 10, y);
  y += 6;

  pdf.text(`• Centres de santé : ${result.health ? "Oui" : "Non"}`, 10, y); y += 6;
  pdf.text(`• Établissements d’enseignement : ${result.school ? "Oui" : "Non"}`, 10, y); y += 6;
  pdf.text(`• Routes : ${result.roads ? "Oui" : "Non"}`, 10, y); y += 6;
  pdf.text(`• Électricité : ${result.electricité ? "Oui" : "Non"}`, 10, y); y += 6;
  pdf.text(`• Eau : ${result.eau ? "Oui" : "Non"}`, 10, y); y += 10;

  // ======== 3) TABLEAU : CENTRES DE SANTÉ ========
  if (result.google_places?.health) {
    pdf.setFontSize(14);
    pdf.text("Centres de santé :", 10, y);
    y += 8;

    Object.entries(result.google_places.health).forEach(([type, data]) => {
      if (data.count > 0) {
        pdf.setFontSize(12);
        pdf.text(`Type : ${type} – Nombre : ${data.count}`, 10, y);  
        y += 6;

        data.places.forEach((p) => {
          pdf.text(`- ${p.name} (${p.lat}, ${p.lon})`, 12, y);
          y += 6;

          // Nouvelle page si besoin
          if (y > 270) {
            pdf.addPage();
            y = 10;
          }
        });

        y += 4;
      }
    });
  }

  // ======== 4) TABLEAU : ÉTABLISSEMENTS SCOLAIRES ========
  if (result.google_places?.schools) {
    pdf.addPage();
    y = 10;

    pdf.setFontSize(14);
    pdf.text("Établissements d’enseignement :", 10, y);
    y += 8;

    Object.entries(result.google_places.schools).forEach(([type, data]) => {
      if (data.count > 0) {
        pdf.setFontSize(12);
        pdf.text(`Type : ${type} – Nombre : ${data.count}`, 10, y);
        y += 6;

        data.places.forEach((p) => {
          pdf.text(`- ${p.name} (${p.lat}, ${p.lon})`, 12, y);
          y += 6;
        });

        y += 4;
      }
    });
  }

  pdf.save("resultat_classification.pdf");
};


const handleDouarSelect = (douarName) => {
  const polygon = DOUARS[douarName];
  if (!polygon) return;

  setSelectedDouar(douarName);

  // ✅ on NE TOUCHE PAS au polygone Al Ouidane
  setSelectedPolygon(polygon);   // ← polygone secondaire
  setPolygonCoords([]);          // reset dessin manuel
  setResult(null);

  handlePolygonClassification(polygon);
};



const waterIcons = {
  reservoirs: {
    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  },
  water_towers: {
    // pistache (vert clair)
    url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  },
  wells: {
    // blanc
    url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  },
  drinking_water_points: {
    // blanc aussi
    url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  }
};

const handleCSVUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`https://site--zone-classification-api--dvl7b6hjp5rp.code.run/polygon/upload_csv`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.polygon) {
      setAlOuidanePolygon(data.polygon); // remplace le polygone actuel
      setPolygonCoords([]); // reset polygone tracé
      setResult(null); // reset résultat précédent
    } else {
      console.error("Erreur CSV :", data.error);
    }
  } catch (err) {
    console.error("Erreur upload CSV :", err);
  }
};

useEffect(() => {
  setMapLoaded(false);
  mapRef.current = null;
}, []);



const equipementRate = result
  ? Math.round(
      ([
        result.health,
        result.school,
        result.roads,
        result.electricité,
        result.eau,
        result.transport,
      ].filter(Boolean).length / 6) * 100
    )
  : 0;

const healthCount = result
  ? Object.values(result.google_places?.health || {}).reduce(
      (s, t) => s + t.count,
      0
    )
  : 0;

const schoolCount = result
  ? Object.values(result.google_places?.schools || {}).reduce(
      (s, t) => s + t.count,
      0
    )
  : 0;


const equipementCircularData = [
  { name: "Équipé", value: equipementRate },
  { name: "Non équipé", value: 100 - equipementRate },
];







  return (
    <Box sx={{ 
        bgcolor: '#f8fafc', // Fond unifié
        minHeight: '100vh',
        p: 4 
    }}>
      <Dialog open={openZoneDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Définition de la zone d’étude
        </DialogTitle>
      
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Veuillez choisir la zone géographique à analyser.
          </Typography>
      
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vous pouvez soit utiliser la zone par défaut <strong>Al Ouidane</strong>,
            soit importer les limites d’une autre commune sous forme d’un fichier CSV
            contenant les coordonnées (x, y).
          </Typography>
      
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2 }}
          >
            Importer un fichier CSV
            <input
              hidden
              type="file"
              accept=".csv"
              onChange={handleCSVUploadFromDialog}
            />
          </Button>
        </DialogContent>
      
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUseAlOuidane}
            sx={{ fontWeight: "bold" }}
          >
            Continuer avec Al Ouidane
          </Button>
        </DialogActions>
      </Dialog>

        <Typography 
            variant="h4" 
            sx={{ 
                fontWeight: 800, 
                mb: 4, 
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}
        >
            <LayersIcon color="primary" sx={{ fontSize: 36 }} /> Situation Géographique & Classification
        </Typography>

       {result && (
         <Box sx={{ mb: 5 }}>
           <Box
             sx={{
               display: "grid",
               gridTemplateColumns: isMobile
                 ? "1fr"
                 : isTablet
                 ? "repeat(2, 1fr)"
                 : "repeat(5, 1fr)",
               gap: 3,
             }}
           >
             {/* 1. Niveau de classification */}
             <Paper
               elevation={0}
               sx={{
                 p: 3,
                 borderRadius: 3,
                 background: `linear-gradient(135deg, ${alpha(
                   categoryInfo.color === 'success' ? theme.palette.success.main :
                   categoryInfo.color === 'warning' ? theme.palette.warning.main :
                   categoryInfo.color === 'error' ? theme.palette.error.main :
                   theme.palette.primary.main, 0.05
                 )} 0%, ${alpha(
                   categoryInfo.color === 'success' ? theme.palette.success.main :
                   categoryInfo.color === 'warning' ? theme.palette.warning.main :
                   categoryInfo.color === 'error' ? theme.palette.error.main :
                   theme.palette.primary.main, 0.15
                 )} 100%)`,
                 border: `2px solid ${alpha(
                   categoryInfo.color === 'success' ? theme.palette.success.main :
                   categoryInfo.color === 'warning' ? theme.palette.warning.main :
                   categoryInfo.color === 'error' ? theme.palette.error.main :
                   theme.palette.primary.main, 0.2
                 )}`,
                 position: "relative",
                 overflow: "hidden",
                 transition: "all 0.3s ease",
                 "&:hover": {
                   transform: "translateY(-4px)",
                   boxShadow: `0 12px 24px ${alpha(
                     categoryInfo.color === 'success' ? theme.palette.success.main :
                     categoryInfo.color === 'warning' ? theme.palette.warning.main :
                     categoryInfo.color === 'error' ? theme.palette.error.main :
                     theme.palette.primary.main, 0.2
                   )}`,
                 },
               }}
             >
               <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                 <Box
                   sx={{
                     width: 56,
                     height: 56,
                     borderRadius: 2.5,
                     background: `linear-gradient(135deg, ${
                       categoryInfo.color === 'success' ? theme.palette.success.main :
                       categoryInfo.color === 'warning' ? theme.palette.warning.main :
                       categoryInfo.color === 'error' ? theme.palette.error.main :
                       theme.palette.primary.main
                     } 0%, ${alpha(
                       categoryInfo.color === 'success' ? theme.palette.success.main :
                       categoryInfo.color === 'warning' ? theme.palette.warning.main :
                       categoryInfo.color === 'error' ? theme.palette.error.main :
                       theme.palette.primary.main, 0.8
                     )} 100%)`,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     boxShadow: `0 4px 12px ${alpha(
                       categoryInfo.color === 'success' ? theme.palette.success.main :
                       categoryInfo.color === 'warning' ? theme.palette.warning.main :
                       categoryInfo.color === 'error' ? theme.palette.error.main :
                       theme.palette.primary.main, 0.3
                     )}`,
                   }}
                 >
                   {/* <LayersIcon sx={{ color: "#fff", fontSize: 28 }} /> */}
                   <TrendingUpIcon sx={{ color: "#fff", fontSize: 28 }} />
                 </Box>
       
                 <Box sx={{ flex: 1 }}>
                   <Typography
                     variant="body2"
                     sx={{
                       color: "text.secondary",
                       fontWeight: 600,
                       mb: 0.5,
                       textTransform: "uppercase",
                       letterSpacing: 0.5,
                       fontSize: "0.75rem",
                     }}
                   >
                     Niveau de classification
                   </Typography>
                   <Typography
                     variant="h5"
                     sx={{
                       fontWeight: 800,
                       color:
                         categoryInfo.color === 'success' ? theme.palette.success.main :
                         categoryInfo.color === 'warning' ? theme.palette.warning.main :
                         categoryInfo.color === 'error' ? theme.palette.error.main :
                         theme.palette.primary.main,
                       lineHeight: 1.2,
                     }}
                   >
                     {categoryInfo.label}
                   </Typography>
                 </Box>
               </Box>
             </Paper>
       
             {/* 2. Taux global d'équipement (Circulaire) */}
             <Paper
               elevation={0}
               sx={{
                 p: 3,
                 borderRadius: 3,
                 background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
                 border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "center",
                 justifyContent: "center",
                 transition: "all 0.3s ease",
                 "&:hover": {
                   transform: "translateY(-4px)",
                   boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                 },
               }}
             >
               <Typography
                 variant="body2"
                 sx={{
                   color: "text.secondary",
                   fontWeight: 600,
                   mb: 2,
                   textTransform: "uppercase",
                   letterSpacing: 0.5,
                   fontSize: "0.75rem",
                   textAlign: "center",
                 }}
               >
                 Taux global d'équipement
               </Typography>
       
               <Box sx={{ position: "relative", display: "inline-flex" }}>
                 <ResponsiveContainer width={120} height={120}>
                   <PieChart>
                     <Pie
                       data={equipementCircularData}
                       dataKey="value"
                       startAngle={90}
                       endAngle={-270}
                       innerRadius={35}
                       outerRadius={50}
                       stroke="none"
                     >
                       <Cell
                         fill={
                           equipementRate >= 75
                             ? theme.palette.success.main
                             : equipementRate >= 50
                             ? theme.palette.warning.main
                             : theme.palette.error.main
                         }
                       />
                       <Cell fill={alpha(theme.palette.text.secondary, 0.1)} />
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
       
                 <Box
                   sx={{
                     position: "absolute",
                     top: "50%",
                     left: "50%",
                     transform: "translate(-50%, -50%)",
                     textAlign: "center",
                   }}
                 >
                   <Typography variant="h5" sx={{ fontWeight: 800, color: equipementRate >= 75 ? theme.palette.success.main : equipementRate >= 50 ? theme.palette.warning.main : theme.palette.error.main }}>
                     {equipementRate}%
                   </Typography>
                   <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                     Équipé
                   </Typography>
                 </Box>
               </Box>
             </Paper>
       
             {/* 3. Centres de santé */}
             <Paper
               elevation={0}
               sx={{
                 p: 3,
                 borderRadius: 3,
                 background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.15)} 100%)`,
                 border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
                 position: "relative",
                 overflow: "hidden",
                 transition: "all 0.3s ease",
                 "&:hover": {
                   transform: "translateY(-4px)",
                   boxShadow: `0 12px 24px ${alpha(theme.palette.error.main, 0.2)}`,
                 },
               }}
             >
               <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                 <Box
                   sx={{
                     width: 56,
                     height: 56,
                     borderRadius: 2.5,
                     background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${alpha(theme.palette.error.main, 0.8)} 100%)`,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                   }}
                 >
                   <LocalHospitalIcon sx={{ color: "#fff", fontSize: 28 }} />
                 </Box>
             
                 <Box sx={{ flex: 1 }}>
                   <Typography
                     variant="body2"
                     sx={{
                       color: "text.secondary",
                       fontWeight: 600,
                       mb: 0.5,
                       textTransform: "uppercase",
                       letterSpacing: 0.5,
                       fontSize: "0.75rem",
                     }}
                   >
                     Centres de santé
                   </Typography>
                   <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.error.main, lineHeight: 1.2 }}>
                     {healthCount}
                   </Typography>
                   <Typography variant="caption" sx={{ color: "text.secondary" }}>
                     Disponibles
                   </Typography>
                 </Box>
               </Box>
             </Paper>
       
             {/* 4. Établissements scolaires */}
             <Paper
               elevation={0}
               sx={{
                 p: 3,
                 borderRadius: 3,
                 background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.15)} 100%)`,
                 border: `2px solid ${alpha(theme.palette.info.main, 0.2)}`,
                 position: "relative",
                 overflow: "hidden",
                 transition: "all 0.3s ease",
                 "&:hover": {
                   transform: "translateY(-4px)",
                   boxShadow: `0 12px 24px ${alpha(theme.palette.info.main, 0.2)}`,
                 },
               }}
             >
               <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                 <Box
                   sx={{
                     width: 56,
                     height: 56,
                     borderRadius: 2.5,
                     background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
                   }}
                 >
                   <SchoolIcon sx={{ color: "#fff", fontSize: 28 }} />
                 </Box>
             
                 <Box sx={{ flex: 1 }}>
                   <Typography
                     variant="body2"
                     sx={{
                       color: "text.secondary",
                       fontWeight: 600,
                       mb: 0.5,
                       textTransform: "uppercase",
                       letterSpacing: 0.5,
                       fontSize: "0.75rem",
                     }}
                   >
                     Établissements scolaires
                   </Typography>
                   <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.info.main, lineHeight: 1.2 }}>
                     {schoolCount}
                   </Typography>
                   <Typography variant="caption" sx={{ color: "text.secondary" }}>
                     Disponibles
                   </Typography>
                 </Box>
               </Box>
             </Paper>
       
             {/* 5. Transports publics */}
             <Paper
               elevation={0}
               sx={{
                 p: 3,
                 borderRadius: 3,
                 background: `linear-gradient(135deg, ${alpha(result.transport ? theme.palette.success.main : theme.palette.text.secondary, 0.05)} 0%, ${alpha(result.transport ? theme.palette.success.main : theme.palette.text.secondary, 0.15)} 100%)`,
                 border: `2px solid ${alpha(result.transport ? theme.palette.success.main : theme.palette.text.secondary, 0.2)}`,
                 position: "relative",
                 overflow: "hidden",
                 transition: "all 0.3s ease",
                 "&:hover": {
                   transform: "translateY(-4px)",
                   boxShadow: `0 12px 24px ${alpha(result.transport ? theme.palette.success.main : theme.palette.text.secondary, 0.2)}`,
                 },
               }}
             >
               <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                 <Box
                   sx={{
                     width: 56,
                     height: 56,
                     borderRadius: 2.5,
                     background: `linear-gradient(135deg, ${result.transport ? theme.palette.success.main : theme.palette.text.secondary} 0%, ${alpha(result.transport ? theme.palette.success.main : theme.palette.text.secondary, 0.8)} 100%)`,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     boxShadow: `0 4px 12px ${alpha(result.transport ? theme.palette.success.main : theme.palette.text.secondary, 0.3)}`,
                   }}
                 >
                   <DirectionsBusIcon sx={{ color: "#fff", fontSize: 28 }} />
                 </Box>
             
                 <Box sx={{ flex: 1 }}>
                   <Typography
                     variant="body2"
                     sx={{
                       color: "text.secondary",
                       fontWeight: 600,
                       mb: 0.5,
                       textTransform: "uppercase",
                       letterSpacing: 0.5,
                       fontSize: "0.75rem",
                     }}
                   >
                     Transports publics
                   </Typography>
                   <Typography
                     variant="h5"
                     sx={{
                       fontWeight: 800,
                       color: result.transport ? theme.palette.success.main : theme.palette.text.secondary,
                       lineHeight: 1.2,
                     }}
                   >
                     {result.transport ? "Présent" : "Absent"}
                   </Typography>
                   <Typography variant="caption" sx={{ color: "text.secondary" }}>
                     {result.transport ? "Disponible" : "Non disponible"}
                   </Typography>
                 </Box>
               </Box>
             </Paper>
           </Box>
         </Box>
       )}



      
        
        <Paper sx={{ p: 3, mb: 5, borderRadius: 3 }} elevation={3}>
         <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {/* 🔍 Bloc d’analyse */}
              Bloc d’analyse
            </Typography>
         
            {/* {result && (
              <Chip
                label={categoryInfo.label}         // "Moyennement équipée"
                color={categoryInfo.color}         // couleur correspondante
                sx={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  height: 32,
                  textAlign: "center",
                }}
              />
            )} */}
          </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 4,
            mb: 4,
          }}
        >
            
            {/* === FORMULAIRE ET RÉSULTATS STATUTAIRES === */}
            <Paper 
                elevation={4} 
                sx={{ p: 3,width: isMobile ? "100%" : 400, maxWidth: 500, borderRadius: 3, height: 'fit-content' }}
            >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.dark }}>
                    <GpsFixedIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Paramètres de classification
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField 
                        label="Coordonnée X (Lambert)" 
                        type="number" 
                        value={x} 
                        onChange={(e) => setX(e.target.value)} 
                        required 
                        variant="outlined" 
                        size="small"
                    />
                    <TextField 
                        label="Coordonnée Y (Lambert)" 
                        type="number" 
                        value={y} 
                        onChange={(e) => setY(e.target.value)} 
                        required 
                        variant="outlined"
                        size="small"
                    />
                    <TextField 
                        label="Rayon (mètres)" 
                        type="number" 
                        value={rayon} 
                        onChange={(e) => setRayon(e.target.value)} 
                        required 
                        variant="outlined"
                        size="small"
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        disabled={loading}
                        size="large"
                        sx={{ mt: 1, fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Classifier la Zone"}
                    </Button>
                    
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={() => setIsDrawing(!isDrawing)}
                        size="large"
                        sx={{ mt: 1, fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {isDrawing ? "Annuler le dessin" : "Classifier par Polygone"}
                    </Button>

                    <FormControl fullWidth size="small">
                      <InputLabel id="douar-label">
                        Choisir un douar
                      </InputLabel>
                    
                      <Select
                        labelId="douar-label"
                        value={selectedDouar}
                        label="Choisir un douar"
                        onChange={(e) => handleDouarSelect(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>-- Sélectionner --</em>
                        </MenuItem>
                    
                        {Object.keys(DOUARS).map((douar) => (
                          <MenuItem key={douar} value={douar}>
                            {douar}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>    
                </Box>
                
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                
            </Paper>
            

            {/* === CARTE INTERACTIVE === */}
             <Box
                ref={mapContainerRef}
                sx={{
                width: isMobile ? "100%" : isTablet ? "100%" : "calc(100% - 420px)",
                height: isMobile ? 300 : isTablet ? 400 : 450,
                  borderRadius: 3,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                }}
              >
             
              
              <LoadScript
                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                libraries={["places", "drawing"]}
              >
                {alOuidanePolygon.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: isMobile ? 300 : 450,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (

                    <GoogleMap
                    //    onLoad={map => (mapRef.current = map)}
                    onLoad={map => {
                        mapRef.current = map;
                        setMapLoaded(true); // indique que la map est prête
                    }}
                       mapContainerStyle={{
                         width: "100%",
                         height: isMobile ? "300px" : "450px",
                       }}
                       center={center}
                       zoom={13}
                       mapTypeId="satellite"
                     >
                        
                        {/* Polygone Al Ouidane toujours visible */}
                        <Polygon
                            key={alOuidanePolygon.length} 
                            paths={alOuidanePolygon}
                            options={{
                                strokeColor: "#0000FF",
                                strokeOpacity: 0.9,
                                strokeWeight: 2,
                                fillColor: alpha(theme.palette.primary.main, 0.4),
                                fillOpacity: 0.4,
                            }}
                        />

                        {/* 🔴 Polygone du douar sélectionné */}
                        {selectedPolygon.length > 0 && (
                          <Polygon
                            paths={selectedPolygon}
                            options={{
                              strokeColor: "#FF0000",
                              strokeOpacity: 0.9,
                              strokeWeight: 2,
                              fillColor: alpha(theme.palette.error.main, 0.3),
                              fillOpacity: 0.4,
                            }}
                          />
                        )}

                        {/* Polygone tracé par l'utilisateur */}
                        {polygonCoords.length > 0 && (
                            <Polygon
                                paths={polygonCoords}
                                options={{
                                    strokeColor: "#FF0000",
                                    strokeOpacity: 0.9,
                                    strokeWeight: 2,
                                    fillColor: alpha(theme.palette.error.main, 0.2),
                                    fillOpacity: 0.4,
                                }}
                            />
                        )}

                        {/* DrawingManager */}
                        {isDrawing && (
                            <DrawingManager
                                onPolygonComplete={(polygon) => {
                                    const path = polygon.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
                                    setPolygonCoords(path);
                                    setSelectedPolygon(path);
                                    setIsDrawing(false);
                                    handlePolygonClassification(path); // Appel de la classification par polygone
                              
                                }}
                                options={{
                                    drawingControl: true,
                                    drawingControlOptions: {
                                        position: window.google.maps.ControlPosition.TOP_CENTER,
                                        drawingModes: ['polygon']
                                    },
                                    polygonOptions: {
                                        fillColor: '#FF0000',
                                        fillOpacity: 0.2,
                                        strokeWeight: 2,
                                        clickable: true,
                                        editable: true,
                                        zIndex: 1
                                    }
                                }}
                            />
                        )}


                        {/* Marqueur + Cercle (logique inchangée) */}
                        {result && (
                            <>
                                <Marker position={center} />
                                <Circle
                                    center={center}
                                    radius={result.rayon}
                                    options={{
                                        strokeColor: result.couleur === "green" ? "#00FF00" : result.couleur === "orange" ? "#FFA500" : result.couleur === "red" ? "#FF0000" : theme.palette.primary.main,
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                        fillColor: result.couleur === "green" ? "#00FF00" : result.couleur === "orange" ? "#FFA500" : result.couleur === "red" ? "#FF0000" : theme.palette.primary.main,
                                        fillOpacity: 0.2,
                                    }}
                                />
                                {/* Markers des écoles, santé et transports */}
                                {/* Markers des écoles */}
                                {result.google_places?.schools &&
                                    Object.values(result.google_places.schools).map((schoolType) =>
                                    schoolType.places.map((place) => (
                                        <Marker
                                        key={place.name}
                                        position={{ lat: place.lat, lng: place.lon }}
                                        label={{
                                            text: "SC",
                                            color: "blue",
                                            fontWeight: "bold"
                                        }}
                                        onClick={() => setSelectedPlace(place)}
                                        />
                                    ))
                                    )}
                                {/* Markers des centres de santé */}
                                {result.google_places?.health &&
                                    Object.values(result.google_places.health).map((healthType) =>
                                    healthType.places.map((place) => (
                                        <Marker
                                        key={place.name}
                                        position={{ lat: place.lat, lng: place.lon }}
                                        label={{
                                            text: "H",
                                            color: "white",
                                            fontWeight: "bold"
                                        }}
                                        onClick={() => setSelectedPlace(place)}
                                        />
                                    ))
                                    )}
                                    {/* Markers des transports */}
                                    {result.google_places?.transport &&
                                    result.google_places.transport.map((place) => (
                                        <Marker
                                        key={place.name}
                                        position={{ lat: place.lat, lng: place.lon }}
                                        label={{
                                            text: "A.BUS",
                                            color: "yellow",
                                            fontWeight: "bold"
                                        }}
                                        onClick={() => setSelectedPlace(place)}
                                        />
                                    ))}
                                    {/* Markers deau  */}
                                    {/* 🔵 Réservoirs */}
                                     {osmWaterMarkers.reservoirs?.map((p, i) => (
                                       <Marker
                                         key={`reservoir-${i}`}
                                         position={{ lat: p.lat, lng: p.lon }}
                                         icon={{
                                           url: waterIcons.reservoirs.url,
                                           scaledSize: new window.google.maps.Size(32, 32)
                                         }}
                                         onClick={() => setSelectedPlace({ ...p, name: "Réservoir" })}
                                       />
                                     ))}
                                     
                                     {/* 🟢 Châteaux d’eau */}
                                     {osmWaterMarkers.water_towers?.map((p, i) => (
                                       <Marker
                                         key={`tower-${i}`}
                                         position={{ lat: p.lat, lng: p.lon }}
                                         icon={{
                                           url: waterIcons.water_towers.url,
                                           scaledSize: new window.google.maps.Size(32, 32)
                                         }}
                                         onClick={() => setSelectedPlace({ ...p, name: "Château d’eau" })}
                                       />
                                     ))}
                                     
                                     {/* ⚪ Puits */}
                                     {osmWaterMarkers.wells?.map((p, i) => (
                                       <Marker
                                         key={`well-${i}`}
                                         position={{ lat: p.lat, lng: p.lon }}
                                         icon={{
                                           url: waterIcons.wells.url,
                                           scaledSize: new window.google.maps.Size(32, 32)
                                         }}
                                         onClick={() => setSelectedPlace({ ...p, name: "Puits" })}
                                       />
                                     ))}
                                     
                                     {/* ⚪ Points d’eau potable */}
                                     {osmWaterMarkers.drinking_water_points?.map((p, i) => (
                                       <Marker
                                         key={`drink-${i}`}
                                         position={{ lat: p.lat, lng: p.lon }}
                                         icon={{
                                           url: waterIcons.drinking_water_points.url,
                                           scaledSize: new window.google.maps.Size(32, 32)
                                         }}
                                         onClick={() => setSelectedPlace({ ...p, name: "Point d’eau potable" })}
                                       />
                                     ))}


                            </>
                        )}

                        {/* InfoWindow */}
                        {selectedPlace && (
                            <InfoWindow
                            position={{ lat: selectedPlace.lat, lng: selectedPlace.lon }}
                            onCloseClick={() => setSelectedPlace(null)}
                            >
                            <div>
                                <strong>{selectedPlace.name}</strong>
                                <br />
                                ({selectedPlace.lat}, {selectedPlace.lon})
                            </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                    )}
                </LoadScript>
                
                {/* ✅ BOUTON — ICI ET NULLE PART AILLEURS */}
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PhotoCameraIcon />}
                    onClick={downloadMapImage}
                    sx={{ fontWeight: "bold", borderRadius: 2 }}
                  >
                    Télécharger la carte (PNG)
                  </Button>
                </Box>
            </Box>

        </Box>
        </Paper>


        {/* === TABLEAUX DE RÉSULTATS DÉTAILLÉS === */}
        {result && (
                <Paper sx={{ p: 3, borderRadius: 3 }} elevation={3}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                    {/* 📊 Bloc des résultats */}
                    Bloc des résultats
                  </Typography>
                
                <Divider sx={{ mb: 4 }} />
                

                {/* === RÉSUMÉ GLOBAL DE LA CLASSIFICATION === */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background:
                      result.couleur === "green"
                        ? alpha(theme.palette.success.main, 0.1)
                        : result.couleur === "orange"
                        ? alpha(theme.palette.warning.main, 0.1)
                        : alpha(theme.palette.error.main, 0.1),
                    border: `2px solid ${alpha(
                      result.couleur === "green"
                        ? theme.palette.success.main
                        : result.couleur === "orange"
                        ? theme.palette.warning.main
                        : theme.palette.error.main,
                      0.3
                    )}`,
                  }}
                >
                  {/* En-tête avec statut */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, flexDirection: isMobile ? "column" : "row" }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${
                          result.couleur === "green"
                            ? theme.palette.success.main
                            : result.couleur === "orange"
                            ? theme.palette.warning.main
                            : theme.palette.error.main
                        } 0%, ${alpha(
                          result.couleur === "green"
                            ? theme.palette.success.main
                            : result.couleur === "orange"
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                          0.8
                        )} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 12px ${alpha(
                          result.couleur === "green"
                            ? theme.palette.success.main
                            : result.couleur === "orange"
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                          0.3
                        )}`,
                      }}
                    >
                      <TrendingUpIcon sx={{ color: "#fff", fontSize: 32 }} />
                    </Box>
                
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Classification de la zone
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          color:
                            result.couleur === "green"
                              ? theme.palette.success.main
                              : result.couleur === "orange"
                              ? theme.palette.warning.main
                              : theme.palette.error.main,
                        }}
                      >
                        {categoryInfo.label}
                      </Typography>
                    </Box>
                
                    <Chip
                      label={`${
                        [result.health, result.school, result.roads, result.electricité, result.eau, result.transport].filter(
                          Boolean
                        ).length
                      }/6`}
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        height: 40,
                        px: 2,
                        bgcolor: alpha(
                          result.couleur === "green"
                            ? theme.palette.success.main
                            : result.couleur === "orange"
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                          0.15
                        ),
                        color:
                          result.couleur === "green"
                            ? theme.palette.success.main
                            : result.couleur === "orange"
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                        border: `2px solid ${alpha(
                          result.couleur === "green"
                            ? theme.palette.success.main
                            : result.couleur === "orange"
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                          0.3
                        )}`,
                      }}
                    />
                  </Box>
                
                  {/* Barre de progression globale */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Taux de disponibilité des équipements
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color:
                            result.couleur === "green"
                              ? theme.palette.success.main
                              : result.couleur === "orange"
                              ? theme.palette.warning.main
                              : theme.palette.error.main,
                        }}
                      >
                        {equipementRate}%
                      </Typography>
                    </Box>
                    <Box sx={{ position: "relative", height: 12, borderRadius: 2, bgcolor: alpha(theme.palette.text.secondary, 0.1) }}>
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          height: "100%",
                          width: `${equipementRate}%`,
                          borderRadius: 2,
                          background: `linear-gradient(90deg, ${
                            result.couleur === "green"
                              ? theme.palette.success.main
                              : result.couleur === "orange"
                              ? theme.palette.warning.main
                              : theme.palette.error.main
                          } 0%, ${alpha(
                            result.couleur === "green"
                              ? theme.palette.success.main
                              : result.couleur === "orange"
                              ? theme.palette.warning.main
                              : theme.palette.error.main,
                            0.7
                          )} 100%)`,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </Box>
                  </Box>
                
                  {/* Grille des équipements */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {[
                      {
                        key: "health",
                        label: "Centres de santé",
                        value: result.health,
                        icon: <LocalHospitalIcon />,
                        color: theme.palette.error.main,
                      },
                      {
                        key: "school",
                        label: "Établissements d'enseignement",
                        value: result.school,
                        icon: <SchoolIcon />,
                        color: theme.palette.info.main,
                      },
                      {
                        key: "roads",
                        label: "Réseaux routiers",
                        value: result.roads,
                        icon: <MapIcon />,
                        color: theme.palette.warning.main,
                      },
                      {
                        key: "electricite",
                        label: "Électricité",
                        value: result.electricité,
                        icon: <ElectricBoltIcon />,
                        color: theme.palette.secondary.main,
                      },
                      {
                        key: "eau",
                        label: "Eau",
                        value: result.eau,
                        icon: <WaterDropIcon />,
                        color: theme.palette.primary.main,
                      },
                      {
                        key: "transport",
                        label: "Transports publics",
                        value: result.transport,
                        icon: <DirectionsBusIcon />,
                        color: theme.palette.success.main,
                      },
                    ].map((equipment) => (
                      <Paper
                        key={equipment.key}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: equipment.value
                            ? alpha(equipment.color, 0.08)
                            : alpha(theme.palette.text.secondary, 0.03),
                          border: `2px solid ${
                            equipment.value ? alpha(equipment.color, 0.2) : alpha(theme.palette.text.secondary, 0.1)
                          }`,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateX(4px)",
                            boxShadow: equipment.value ? `0 4px 12px ${alpha(equipment.color, 0.15)}` : "none",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            bgcolor: equipment.value
                              ? alpha(equipment.color, 0.15)
                              : alpha(theme.palette.text.secondary, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {React.cloneElement(equipment.icon, {
                            sx: {
                              color: equipment.value ? equipment.color : theme.palette.text.secondary,
                              fontSize: 24,
                            },
                          })}
                        </Box>
                
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: equipment.value ? equipment.color : theme.palette.text.secondary,
                              mb: 0.5,
                            }}
                          >
                            {equipment.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: equipment.value ? equipment.color : theme.palette.text.secondary,
                              px: 1,
                              py: 0.3,
                              borderRadius: 1,
                              bgcolor: equipment.value ? alpha(equipment.color, 0.1) : "transparent",
                              display: "inline-block",
                            }}
                          >
                            {equipment.value ? "Disponible" : "Non disponible"}
                          </Typography>
                        </Box>
                
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            bgcolor: equipment.value
                              ? alpha(equipment.color, 0.15)
                              : alpha(theme.palette.text.secondary, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: equipment.value ? equipment.color : theme.palette.text.secondary,
                            }}
                          />
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Paper>

                
                {/* Centres de santé */}
                {result.google_places.health && Object.values(result.google_places.health).some(data => data.count > 0) && (
                    <TableContainer component={Paper} elevation={4} sx={{ mb: 4, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ p: 2, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>Centres de santé</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Liste des établissements (Nom / Coordonnées)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(result.google_places.health).map(([type, data]) => data.count > 0 && (
                                    <TableRow key={type}>
                                        <TableCell>{translateHealthType(type)}</TableCell>
                                        <TableCell>{data.count}</TableCell>
                                        <TableCell>
                                            {data.places.map((place) => (
                                                <Typography key={place.name} variant="body2">
                                                    <strong>{place.name}</strong> ({place.lat}, {place.lon})
                                                </Typography>
                                            ))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Établissements scolaires */}
                {result.google_places.schools && Object.values(result.google_places.schools).some(data => data.count > 0) && (
                    <TableContainer component={Paper} elevation={4} sx={{ mb: 4, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ p: 2, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>Établissements d'enseignement</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Liste des établissements (Nom / Coordonnées)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(result.google_places.schools).map(([type, data]) => data.count > 0 && (
                                    <TableRow key={type}>
                                        <TableCell>{translateSchoolType(type)}</TableCell>
                                        <TableCell>{data.count}</TableCell>
                                        <TableCell>
                                            {data.places.map((place) => (
                                                <Typography key={place.name} variant="body2">
                                                    <strong>{place.name}</strong> ({place.lat}, {place.lon})
                                                </Typography>
                                            ))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            {/* </Box> */}
            </Paper>
)}
     
        {result && (
          <Button
            variant="contained"
            color="success"
            onClick={generatePDF}
            sx={{ mt: 2, fontWeight: "bold" }}
          >
            Télécharger le PDF
          </Button>
        )}
    </Box>
  );
}




// import React, { useState, useEffect,useRef } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   CircularProgress,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   useTheme,
//   alpha,
//   Chip,
//   Divider,
//   Alert 
// } from "@mui/material";
// import fetchWithAuth from "../utils/api";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CancelIcon from "@mui/icons-material/Cancel";
// import GpsFixedIcon from '@mui/icons-material/GpsFixed';
// import LayersIcon from '@mui/icons-material/Layers';
// import API_BASE_URL from '../utils/apiConfig'
// import { Autocomplete } from "@react-google-maps/api";
// import useMediaQuery from '@mui/material/useMediaQuery';

// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import ArabicFontBase64 from "./fonts"; 
// import {  FormControl, InputLabel, Select, MenuItem } from "@mui/material";
// import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";





// // Google Maps
// import { GoogleMap, LoadScript, Marker, Circle, InfoWindow, Polygon, DrawingManager } from "@react-google-maps/api";

// const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


// // Fonction de mappage de couleur pour les résultats (MODIFIÉE)
// const getCategoryStyles = (category) => {
//     switch (category) {
//         case "green":
//             // 'green' -> Bien équipée
//             return { label: "Bien équipée", color: 'success' };
//         case "orange":
//             // 'orange' -> Moyennement équipée
//             return { label: "Moyennement équipée", color: 'warning' };
//         case "red":
//             // 'red' -> Mal équipée
//             return { label: "Mal équipée", color: 'error' };
//         default:
//             return { label: "Non Classifié", color: 'default' };
//     }
// };

// const DOUARS = {
//   chwiter: [
//     { lat: 31.579348, lng: -7.814637 },
//     { lat: 31.571707, lng: -7.825667 },
//     { lat: 31.566954, lng: -7.813479 },
//     { lat: 31.569842, lng: -7.804338 },
//     { lat: 31.569806, lng: -7.795712 },
//     { lat: 31.575290, lng: -7.796742 },
//   ],

//   "Douar Ait Lahmad": [
//     { lat: 31.584874, lng: -7.811596 },
//     { lat: 31.583210, lng: -7.814042 },
//     { lat: 31.580249, lng: -7.808463 },
//     { lat: 31.582187, lng: -7.806854 },
//     { lat: 31.583210, lng: -7.804171 },
//     { lat: 31.586793, lng: -7.807926 },
//   ],

//   "Douar Laadem": [
//     { lat: 31.582165, lng: -7.850451 },
//     { lat: 31.579498, lng: -7.850297 },
//     { lat: 31.579645, lng: -7.846859 },
//     { lat: 31.577633, lng: -7.847070 },
//     { lat: 31.577944, lng: -7.845284 },
//     { lat: 31.583081, lng: -7.846379 },
//   ],

//   "Oulad El Guern": [
//     { lat: 31.587373, lng: -7.796039 },
//     { lat: 31.585359, lng: -7.792402 },
//     { lat: 31.586359, lng: -7.788558 },
//     { lat: 31.588128, lng: -7.789400 },
//     { lat: 31.588441, lng: -7.792437 },
//   ],
// };





// export default function SituationMap() {
//   const theme = useTheme();

//   const [x, setX] = useState("");
//   const [y, setY] = useState("");
//   const [rayon, setRayon] = useState(2000);
//   const [result, setResult] = useState(null);
//   const [osmWaterMarkers, setOsmWaterMarkers] = useState({
//     reservoirs: [],
//     water_towers: [],
//     wells: [],
//     drinking_water_points: []
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedPlace, setSelectedPlace] = useState(null);

//   const [alOuidanePolygon, setAlOuidanePolygon] = useState([]);

//   const [isDrawing, setIsDrawing] = useState(false); // Pour activer le dessin
//   const [polygonCoords, setPolygonCoords] = useState([]); // Stocke les coordonnées tracées

//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
//   const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >900px 

//   const mapContainerRef = useRef(null);
//   const [selectedDouar, setSelectedDouar] = useState("");





//   // --- Logique inchangée ---
//   useEffect(() => {
//     const fetchPolygon = async () => {
//       try {
//         const res = await fetchWithAuth(`${API_BASE_URL}/api/zones/al_ouidane`);
//         const data = await res.json();
//         setAlOuidanePolygon(data.polygon); // [{lat, lng}, {lat, lng}, ...]
//       } catch (err) {
//         console.error("Erreur chargement polygone:", err);
//       }
//     };
//     fetchPolygon();
//   }, []);

//   const mapRef = useRef(null);

//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

// //   useEffect(() => {
// //     if (mapRef.current && alOuidanePolygon.length > 0) {
// //       const bounds = new window.google.maps.LatLngBounds();
// //       alOuidanePolygon.forEach(p => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
// //       mapRef.current.fitBounds(bounds);
// //     }
// //   }, [alOuidanePolygon, mapRef.current]);
// useEffect(() => {
//     if (alOuidanePolygon.length > 0 && mapRef.current) {
//         const bounds = new window.google.maps.LatLngBounds();
//         alOuidanePolygon.forEach(p => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
//         mapRef.current.fitBounds(bounds);
//         setMapCenter(bounds.getCenter().toJSON()); // met à jour le center pour les markers
//     }
// }, [alOuidanePolygon, mapLoaded]);


//   // --- Logique inchangée ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setResult(null);
//     try {
//       const res = await fetchWithAuth(`${API_BASE_URL}/api/zones/classifier`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ x, y, rayon }),
//       });
//       if (!res.ok) throw new Error("Erreur serveur");
//       const data = await res.json();
//       setResult(data);
//       if (data.osm && data.osm.water_points) {
//         setOsmWaterMarkers(data.osm.water_points || {
//            reservoirs: [],
//            water_towers: [],
//            wells: [],
//            drinking_water_points: []
//          });

//       }
//     } catch (err) {
//       setError("Erreur lors de la classification");
//     }
//     setLoading(false);
//   };

//   const translateHealthType = (type) => {
//     switch (type) {
//       case "hospital": return "Hôpitaux/Centres";
//       case "doctor": return "Cabinets médicaux";
//       default: return type;
//     }
//   };

//   const translateSchoolType = (type) => {
//     switch (type) {
//       case "primary": return "Primaire";
//       case "college": return "Collège";
//       case "lycee": return "Lycée";
//       case "maternelle": return "Maternelle";
//       case "unknown": return "Inconnu";
//       default: return type;
//     }
//   };

//   // Centre initial 
//   const center = result
//     ? { lat: result.latitude, lng: result.longitude }
//     : alOuidanePolygon.length > 0
//       ? {
//           lat: alOuidanePolygon.reduce((sum, p) => sum + p.lat, 0) / alOuidanePolygon.length,
//           lng: alOuidanePolygon.reduce((sum, p) => sum + p.lng, 0) / alOuidanePolygon.length
//         }
//       : { lat: 0, lng: 0 }; // fallback

//   // --- FIN Logique inchangée ---

//   const categoryInfo = result ? getCategoryStyles(result.couleur) : {};

//   const handlePolygonClassification = async (polygon) => {
//   setLoading(true);
//   setError("");
//   setResult(null);

//   try {
//     console.log("➡️ Polygon envoyé au microservice Python :", polygon);

//     const res = await fetch("https://site--zone-classification-api--dvl7b6hjp5rp.code.run/classify_polygon", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         polygon: polygon.map(p => ({
//           lat: p.lat,  // ⚠️ garde lat en premier
//           lng: p.lng
//         }))
//       }),
//     });

//     if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
//     const data = await res.json();

//     console.log("✅ Résultat du microservice :", data);
//     setResult(data);
//     if (data.osm && data.osm.water_points) {
//      setOsmWaterMarkers(data.osm.water_points || {
//        reservoirs: [],
//        water_towers: [],
//        wells: [],
//        drinking_water_points: []
//      });

//     }
//   } catch (err) {
//     console.error("❌ Erreur classification polygone :", err);
//     setError("Erreur lors de la classification par polygone");
//   }

//   setLoading(false);
// };



// const downloadMapImage = async () => {
//   if (!mapContainerRef.current) return;

//   try {
//     const canvas = await html2canvas(mapContainerRef.current, {
//       useCORS: true,
//       scale: 2
//     });

//     const image = canvas.toDataURL("image/png");

//     // Création d’un lien de téléchargement
//     const link = document.createElement("a");
//     link.href = image;
//     link.download = "situation_geographique_map.png";
//     link.click();
//   } catch (error) {
//     console.error("Erreur capture map :", error);
//   }
// };


// const generatePDF = async () => {
//   if (!result) return;

//   const pdf = new jsPDF("p", "mm", "a4");

// // Ajouter police arabe
//   pdf.addFileToVFS("ArabicFont.ttf", ArabicFontBase64);
//   pdf.addFont("ArabicFont.ttf", "ArabicFont", "normal");
//   pdf.setFont("ArabicFont"); // Définit la police pour le texte suivant

//   let y = 10;

//   // ======== 1) CAPTURE DE LA CARTE ========
//   const mapElement = mapContainerRef.current;

//   const canvas = await html2canvas(mapElement, {
//     useCORS: true,
//     scale: 2
//   });

//   const imgData = canvas.toDataURL("image/png");

//   pdf.addImage(imgData, "PNG", 10, y, 190, 100);
//   y += 110;

//   // ======== 2) INFORMATIONS DE CLASSIFICATION ========
//   pdf.setFontSize(14);
//   pdf.text("Résultat de la classification :", 10, y);
//   y += 8;

//   pdf.setFontSize(12);
//   pdf.text(`• Niveau : ${getCategoryStyles(result.couleur).label}`, 10, y);
//   y += 6;

//   pdf.text(`• Centres de santé : ${result.health ? "Oui" : "Non"}`, 10, y); y += 6;
//   pdf.text(`• Établissements d’enseignement : ${result.school ? "Oui" : "Non"}`, 10, y); y += 6;
//   pdf.text(`• Routes : ${result.roads ? "Oui" : "Non"}`, 10, y); y += 6;
//   pdf.text(`• Électricité : ${result.electricité ? "Oui" : "Non"}`, 10, y); y += 6;
//   pdf.text(`• Eau : ${result.eau ? "Oui" : "Non"}`, 10, y); y += 10;

//   // ======== 3) TABLEAU : CENTRES DE SANTÉ ========
//   if (result.google_places?.health) {
//     pdf.setFontSize(14);
//     pdf.text("Centres de santé :", 10, y);
//     y += 8;

//     Object.entries(result.google_places.health).forEach(([type, data]) => {
//       if (data.count > 0) {
//         pdf.setFontSize(12);
//         pdf.text(`Type : ${type} – Nombre : ${data.count}`, 10, y);  
//         y += 6;

//         data.places.forEach((p) => {
//           pdf.text(`- ${p.name} (${p.lat}, ${p.lon})`, 12, y);
//           y += 6;

//           // Nouvelle page si besoin
//           if (y > 270) {
//             pdf.addPage();
//             y = 10;
//           }
//         });

//         y += 4;
//       }
//     });
//   }

//   // ======== 4) TABLEAU : ÉTABLISSEMENTS SCOLAIRES ========
//   if (result.google_places?.schools) {
//     pdf.addPage();
//     y = 10;

//     pdf.setFontSize(14);
//     pdf.text("Établissements d’enseignement :", 10, y);
//     y += 8;

//     Object.entries(result.google_places.schools).forEach(([type, data]) => {
//       if (data.count > 0) {
//         pdf.setFontSize(12);
//         pdf.text(`Type : ${type} – Nombre : ${data.count}`, 10, y);
//         y += 6;

//         data.places.forEach((p) => {
//           pdf.text(`- ${p.name} (${p.lat}, ${p.lon})`, 12, y);
//           y += 6;
//         });

//         y += 4;
//       }
//     });
//   }

//   pdf.save("resultat_classification.pdf");
// };

// const handleDouarSelect = (douarName) => {
//   const polygon = DOUARS[douarName];
//   if (!polygon) return;

//   setSelectedDouar(douarName);
//   setAlOuidanePolygon(polygon);   // affiche le polygone
//   setPolygonCoords([]);           // reset dessin manuel
//   setResult(null);                // reset ancien résultat

//   // 🔥 Lancer automatiquement la classification
//   handlePolygonClassification(polygon);
// };


// const waterIcons = {
//   reservoirs: {
//     url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//   },
//   water_towers: {
//     // pistache (vert clair)
//     url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
//   },
//   wells: {
//     // blanc
//     url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
//   },
//   drinking_water_points: {
//     // blanc aussi
//     url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
//   }
// };

// const handleCSVUpload = async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const formData = new FormData();
//   formData.append("file", file);

//   try {
//     const res = await fetch(`http://127.0.0.1:8000/polygon/upload_csv`, {
//       method: "POST",
//       body: formData
//     });
//     const data = await res.json();
//     if (data.polygon) {
//       setAlOuidanePolygon(data.polygon); // remplace le polygone actuel
//       setPolygonCoords([]); // reset polygone tracé
//       setResult(null); // reset résultat précédent
//     } else {
//       console.error("Erreur CSV :", data.error);
//     }
//   } catch (err) {
//     console.error("Erreur upload CSV :", err);
//   }
// };




//   return (
//     <Box sx={{ 
//         bgcolor: '#f8fafc', // Fond unifié
//         minHeight: '100vh',
//         p: 4 
//     }}>
//         <Typography 
//             variant="h4" 
//             sx={{ 
//                 fontWeight: 800, 
//                 mb: 4, 
//                 color: theme.palette.text.primary,
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 1
//             }}
//         >
//             <LayersIcon color="primary" sx={{ fontSize: 36 }} /> Situation Géographique & Classification
//         </Typography>

//         {/* <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4 }}> */}
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: isMobile ? "column" : "row",
//             gap: isMobile ? 2 : 4,
//             mb: 4,
//           }}
//         >
            
//             {/* === FORMULAIRE ET RÉSULTATS STATUTAIRES === */}
//             <Paper 
//                 elevation={4} 
//                 sx={{ p: 3,width: isMobile ? "100%" : 400, maxWidth: 500, borderRadius: 3, height: 'fit-content' }}
//             >
//                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.dark }}>
//                     <GpsFixedIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Paramètres de classification
//                 </Typography>
                
//                 <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                     <TextField 
//                         label="Coordonnée X (Lambert)" 
//                         type="number" 
//                         value={x} 
//                         onChange={(e) => setX(e.target.value)} 
//                         required 
//                         variant="outlined" 
//                         size="small"
//                     />
//                     <TextField 
//                         label="Coordonnée Y (Lambert)" 
//                         type="number" 
//                         value={y} 
//                         onChange={(e) => setY(e.target.value)} 
//                         required 
//                         variant="outlined"
//                         size="small"
//                     />
//                     <TextField 
//                         label="Rayon (mètres)" 
//                         type="number" 
//                         value={rayon} 
//                         onChange={(e) => setRayon(e.target.value)} 
//                         required 
//                         variant="outlined"
//                         size="small"
//                     />
//                     <Button 
//                         type="submit" 
//                         variant="contained" 
//                         color="primary" 
//                         disabled={loading}
//                         size="large"
//                         sx={{ mt: 1, fontWeight: 'bold', borderRadius: 2 }}
//                     >
//                         {loading ? <CircularProgress size={24} color="inherit" /> : "Classifier la Zone"}
//                     </Button>
                    
//                     <Button 
//                         variant="contained" 
//                         color="secondary"
//                         onClick={() => setIsDrawing(!isDrawing)}
//                         size="large"
//                         sx={{ mt: 1, fontWeight: 'bold', borderRadius: 2 }}
//                     >
//                         {isDrawing ? "Annuler le dessin" : "Classifier par Polygone"}
//                     </Button>

//                     <FormControl fullWidth size="small">
//                       <InputLabel id="douar-label">
//                         Choisir un douar
//                       </InputLabel>
                    
//                       <Select
//                         labelId="douar-label"
//                         value={selectedDouar}
//                         label="Choisir un douar"
//                         onChange={(e) => handleDouarSelect(e.target.value)}
//                       >
//                         <MenuItem value="">
//                           <em>-- Sélectionner --</em>
//                         </MenuItem>
                    
//                         {Object.keys(DOUARS).map((douar) => (
//                           <MenuItem key={douar} value={douar}>
//                             {douar}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
                     
//                     {/* <Box sx={{ mb: 2 }}>
//                       <input
//                         type="file"
//                         accept=".csv"
//                         onChange={handleCSVUpload}
//                       />
//                     </Box> */}
//                     <Box sx={{ mb: 2 }}>
//                       <Typography
//                         variant="body2"
//                         sx={{
//                           mb: 1,
//                           color: "text.secondary",
//                           fontStyle: "italic"
//                         }}
//                       >
//                         Télécharger les limites de la commune concernée sous forme de coordonnées (x, y) dans un fichier CSV.
//                       </Typography>
                    
//                       <input
//                         type="file"
//                         accept=".csv"
//                         onChange={handleCSVUpload}
//                       />
//                     </Box>     
//                 </Box>
                
//                 {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                
//                 {result && (
//                     <Box sx={{ mt: 4, borderTop: `1px solid ${theme.palette.divider}`, pt: 3 }}>
                        
//                         <Box sx={{ 
//                             display: 'flex', 
//                             alignItems: 'center', 
//                             justifyContent: 'flex-start', 
//                             mb: 2 ,
//                             flexDirection: isMobile ? 'column' : 'row', // ← ajoute cette ligne
//                             gap: 1 
//                         }}>
//                             <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: isMobile ? 0 : 2  }}>
//                                 Résultat de la classification :
//                             </Typography>
                            
//                             <Chip
//                                 label={categoryInfo.label}
//                                 color={categoryInfo.color}
//                                 sx={{ 
//                                     fontWeight: 'bold', 
//                                     fontSize: '1rem', 
//                                     height: 32,
//                                     width: isMobile ? '100%' : 'auto', 
//                                     textAlign: 'center'
//                                 }}
//                             />
//                         </Box>
                        
//                         {/* Indicateurs de présence */}
//                         <Box 
//                             sx={{ 
//                                 display: 'grid', 
//                                 gridTemplateColumns: '1fr 1fr', 
//                                 gap: 1 
//                             }}
//                         >
//                             {[
//                                 { label: 'Centres de santé', value: result.health },
//                                 { label: 'Établissements d’enseignement', value: result.school },
//                                 { label: 'Réseaux routiers', value: result.roads },
//                                 { label: 'Électricité', value: result.electricité },
//                                 { label: 'Eau', value: result.eau },
//                                 { label: 'Transports publics', value: result.transport },
//                             ].map((item) => (
//                                 <Typography key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: '0.9rem' }}>
//                                     {item.value ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
//                                     {item.label}
//                                 </Typography>
//                             ))}
//                         </Box>
//                     </Box>
//                 )}
//             </Paper>
            

//             {/* === CARTE INTERACTIVE === */}
//              <Box
//                 ref={mapContainerRef}
//                 sx={{
//                 width: isMobile ? "100%" : isTablet ? "100%" : "calc(100% - 420px)",
//                 height: isMobile ? 300 : isTablet ? 400 : 450,
//                   borderRadius: 3,
//                   boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
//                 }}
//               >
             
//               {alOuidanePolygon.length === 0 ? (
//                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
//                    <CircularProgress />
//                  </Box>
//                ) : (
//                 <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places", "drawing"]}>
                  
//                     <GoogleMap
//                     //    onLoad={map => (mapRef.current = map)}
//                     onLoad={map => {
//                         mapRef.current = map;
//                         setMapLoaded(true); // indique que la map est prête
//                     }}
//                        mapContainerStyle={{
//                          width: "100%",
//                          height: isMobile ? "300px" : "450px",
//                        }}
//                        center={center}
//                        zoom={13}
//                        mapTypeId="satellite"
//                      >
                        
//                         {/* Polygone Al Ouidane toujours visible */}
//                         <Polygon
//                             key={alOuidanePolygon.length} 
//                             paths={alOuidanePolygon}
//                             options={{
//                                 strokeColor: "#0000FF",
//                                 strokeOpacity: 0.9,
//                                 strokeWeight: 2,
//                                 fillColor: alpha(theme.palette.primary.main, 0.4),
//                                 fillOpacity: 0.4,
//                             }}
//                         />
   

//                         {/* Polygone tracé par l'utilisateur */}
//                         {polygonCoords.length > 0 && (
//                             <Polygon
//                                 paths={polygonCoords}
//                                 options={{
//                                     strokeColor: "#FF0000",
//                                     strokeOpacity: 0.9,
//                                     strokeWeight: 2,
//                                     fillColor: alpha(theme.palette.error.main, 0.2),
//                                     fillOpacity: 0.4,
//                                 }}
//                             />
//                         )}

//                         {/* DrawingManager */}
//                         {isDrawing && (
//                             <DrawingManager
//                                 onPolygonComplete={(polygon) => {
//                                     const path = polygon.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
//                                     setPolygonCoords(path);
//                                     setIsDrawing(false);
//                                     handlePolygonClassification(path); // Appel de la classification par polygone
                              
//                                 }}
//                                 options={{
//                                     drawingControl: true,
//                                     drawingControlOptions: {
//                                         position: window.google.maps.ControlPosition.TOP_CENTER,
//                                         drawingModes: ['polygon']
//                                     },
//                                     polygonOptions: {
//                                         fillColor: '#FF0000',
//                                         fillOpacity: 0.2,
//                                         strokeWeight: 2,
//                                         clickable: true,
//                                         editable: true,
//                                         zIndex: 1
//                                     }
//                                 }}
//                             />
//                         )}


//                         {/* Marqueur + Cercle (logique inchangée) */}
//                         {result && (
//                             <>
//                                 <Marker position={center} />
//                                 <Circle
//                                     center={center}
//                                     radius={result.rayon}
//                                     options={{
//                                         strokeColor: result.couleur === "green" ? "#00FF00" : result.couleur === "orange" ? "#FFA500" : result.couleur === "red" ? "#FF0000" : theme.palette.primary.main,
//                                         strokeOpacity: 0.8,
//                                         strokeWeight: 2,
//                                         fillColor: result.couleur === "green" ? "#00FF00" : result.couleur === "orange" ? "#FFA500" : result.couleur === "red" ? "#FF0000" : theme.palette.primary.main,
//                                         fillOpacity: 0.2,
//                                     }}
//                                 />
//                                 {/* Markers des écoles, santé et transports */}
//                                 {/* Markers des écoles */}
//                                 {result.google_places?.schools &&
//                                     Object.values(result.google_places.schools).map((schoolType) =>
//                                     schoolType.places.map((place) => (
//                                         <Marker
//                                         key={place.name}
//                                         position={{ lat: place.lat, lng: place.lon }}
//                                         label={{
//                                             text: "SC",
//                                             color: "blue",
//                                             fontWeight: "bold"
//                                         }}
//                                         onClick={() => setSelectedPlace(place)}
//                                         />
//                                     ))
//                                     )}
//                                 {/* Markers des centres de santé */}
//                                 {result.google_places?.health &&
//                                     Object.values(result.google_places.health).map((healthType) =>
//                                     healthType.places.map((place) => (
//                                         <Marker
//                                         key={place.name}
//                                         position={{ lat: place.lat, lng: place.lon }}
//                                         label={{
//                                             text: "H",
//                                             color: "white",
//                                             fontWeight: "bold"
//                                         }}
//                                         onClick={() => setSelectedPlace(place)}
//                                         />
//                                     ))
//                                     )}
//                                     {/* Markers des transports */}
//                                     {result.google_places?.transport &&
//                                     result.google_places.transport.map((place) => (
//                                         <Marker
//                                         key={place.name}
//                                         position={{ lat: place.lat, lng: place.lon }}
//                                         label={{
//                                             text: "A.BUS",
//                                             color: "yellow",
//                                             fontWeight: "bold"
//                                         }}
//                                         onClick={() => setSelectedPlace(place)}
//                                         />
//                                     ))}
//                                     {/* Markers deau  */}
//                                     {/* 🔵 Réservoirs */}
//                                      {osmWaterMarkers.reservoirs?.map((p, i) => (
//                                        <Marker
//                                          key={`reservoir-${i}`}
//                                          position={{ lat: p.lat, lng: p.lon }}
//                                          icon={{
//                                            url: waterIcons.reservoirs.url,
//                                            scaledSize: new window.google.maps.Size(32, 32)
//                                          }}
//                                          onClick={() => setSelectedPlace({ ...p, name: "Réservoir" })}
//                                        />
//                                      ))}
                                     
//                                      {/* 🟢 Châteaux d’eau */}
//                                      {osmWaterMarkers.water_towers?.map((p, i) => (
//                                        <Marker
//                                          key={`tower-${i}`}
//                                          position={{ lat: p.lat, lng: p.lon }}
//                                          icon={{
//                                            url: waterIcons.water_towers.url,
//                                            scaledSize: new window.google.maps.Size(32, 32)
//                                          }}
//                                          onClick={() => setSelectedPlace({ ...p, name: "Château d’eau" })}
//                                        />
//                                      ))}
                                     
//                                      {/* ⚪ Puits */}
//                                      {osmWaterMarkers.wells?.map((p, i) => (
//                                        <Marker
//                                          key={`well-${i}`}
//                                          position={{ lat: p.lat, lng: p.lon }}
//                                          icon={{
//                                            url: waterIcons.wells.url,
//                                            scaledSize: new window.google.maps.Size(32, 32)
//                                          }}
//                                          onClick={() => setSelectedPlace({ ...p, name: "Puits" })}
//                                        />
//                                      ))}
                                     
//                                      {/* ⚪ Points d’eau potable */}
//                                      {osmWaterMarkers.drinking_water_points?.map((p, i) => (
//                                        <Marker
//                                          key={`drink-${i}`}
//                                          position={{ lat: p.lat, lng: p.lon }}
//                                          icon={{
//                                            url: waterIcons.drinking_water_points.url,
//                                            scaledSize: new window.google.maps.Size(32, 32)
//                                          }}
//                                          onClick={() => setSelectedPlace({ ...p, name: "Point d’eau potable" })}
//                                        />
//                                      ))}


//                             </>
//                         )}

//                         {/* InfoWindow */}
//                         {selectedPlace && (
//                             <InfoWindow
//                             position={{ lat: selectedPlace.lat, lng: selectedPlace.lon }}
//                             onCloseClick={() => setSelectedPlace(null)}
//                             >
//                             <div>
//                                 <strong>{selectedPlace.name}</strong>
//                                 <br />
//                                 ({selectedPlace.lat}, {selectedPlace.lon})
//                             </div>
//                             </InfoWindow>
//                         )}
//                     </GoogleMap>
//                 </LoadScript>
//                 )}
//                 {/* ✅ BOUTON — ICI ET NULLE PART AILLEURS */}
//                 <Box sx={{ mt: 2, textAlign: "center" }}>
//                   <Button
//                     variant="outlined"
//                     color="primary"
//                     startIcon={<PhotoCameraIcon />}
//                     onClick={downloadMapImage}
//                     sx={{ fontWeight: "bold", borderRadius: 2 }}
//                   >
//                     Télécharger la carte (PNG)
//                   </Button>
//                 </Box>
//             </Box>

//         </Box>

//         {/* === TABLEAUX DE RÉSULTATS DÉTAILLÉS === */}
//         {result && result.google_places && (
//             <Box sx={{ width: "100%", mt: 4, mb: 4 }}>
//                 <Divider sx={{ mb: 4 }} />
                
//                 {/* Centres de santé */}
//                 {result.google_places.health && Object.values(result.google_places.health).some(data => data.count > 0) && (
//                     <TableContainer component={Paper} elevation={4} sx={{ mb: 4, borderRadius: 2 }}>
//                         <Typography variant="h6" sx={{ p: 2, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>Centres de santé</Typography>
//                         <Table size="small">
//                             <TableHead>
//                                 <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>Liste des établissements (Nom / Coordonnées)</TableCell>
//                                 </TableRow>
//                             </TableHead>
//                             <TableBody>
//                                 {Object.entries(result.google_places.health).map(([type, data]) => data.count > 0 && (
//                                     <TableRow key={type}>
//                                         <TableCell>{translateHealthType(type)}</TableCell>
//                                         <TableCell>{data.count}</TableCell>
//                                         <TableCell>
//                                             {data.places.map((place) => (
//                                                 <Typography key={place.name} variant="body2">
//                                                     <strong>{place.name}</strong> ({place.lat}, {place.lon})
//                                                 </Typography>
//                                             ))}
//                                         </TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </TableContainer>
//                 )}

//                 {/* Établissements scolaires */}
//                 {result.google_places.schools && Object.values(result.google_places.schools).some(data => data.count > 0) && (
//                     <TableContainer component={Paper} elevation={4} sx={{ mb: 4, borderRadius: 2 }}>
//                         <Typography variant="h6" sx={{ p: 2, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>Établissements d'enseignement</Typography>
//                         <Table size="small">
//                             <TableHead>
//                                 <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>Liste des établissements (Nom / Coordonnées)</TableCell>
//                                 </TableRow>
//                             </TableHead>
//                             <TableBody>
//                                 {Object.entries(result.google_places.schools).map(([type, data]) => data.count > 0 && (
//                                     <TableRow key={type}>
//                                         <TableCell>{translateSchoolType(type)}</TableCell>
//                                         <TableCell>{data.count}</TableCell>
//                                         <TableCell>
//                                             {data.places.map((place) => (
//                                                 <Typography key={place.name} variant="body2">
//                                                     <strong>{place.name}</strong> ({place.lat}, {place.lon})
//                                                 </Typography>
//                                             ))}
//                                         </TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </TableContainer>
//                 )}
//             </Box>
//         )}
//         {result && (
//           <Button
//             variant="contained"
//             color="success"
//             onClick={generatePDF}
//             sx={{ mt: 2, fontWeight: "bold" }}
//           >
//             Télécharger le PDF
//           </Button>
//         )}
//     </Box>
//   );
// }





