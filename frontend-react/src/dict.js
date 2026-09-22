const dict = {
  en: {
    appTitle: "Urban Flood Nowcast",
    punePilot: "Pune Pilot",
    ruleBased: "Rule-Based",
    ml: "ML (Random Forest)",
    simControls: "Simulation Controls",
    rainBurst: "Rain Burst",
    dragInject: "Drag to inject a sudden rainfall burst and observe real-time risk shifts.",
    fetchLive: "Fetch Live Weather",
    summaryStats: "Summary Stats (45 Zones)",
    clickStat: "Click a stat card to highlight zones on the map.",
    replayEvent: "Replay Last Storm Event",
    downloadReport: "Download PDF Report",
    currentRisk: "Current Risk",
    score: "Score",
    explainability: "Explainability Breakdown",
    modelWeight: "Model's weighted contribution of each feature towards the final risk score.",
    trend: "6-Hour Rainfall Trend (mm)",
    nearestSafer: "Nearest safer zone",
    confidence: "Model Confidence"
  },
  mr: {
    appTitle: "शहरी पूर अंदाज",
    punePilot: "पुणे पायलट",
    ruleBased: "नियम-आधारित",
    ml: "एमएल (रँडम फॉरेस्ट)",
    simControls: "सिम्युलेशन नियंत्रणे",
    rainBurst: "पावसाची तीव्रता",
    dragInject: "अचानक पावसाची तीव्रता वाढवण्यासाठी ड्रॅग करा आणि रिअल-टाइम धोक्याचे बदल पहा.",
    fetchLive: "थेट हवामान मिळवा",
    summaryStats: "सारांश आकडेवारी (४५ विभाग)",
    clickStat: "नकाशावर विभाग हायलाइट करण्यासाठी कार्डवर क्लिक करा.",
    replayEvent: "मागील वादळ पुन्हा प्ले करा",
    downloadReport: "पीडीएफ अहवाल डाउनलोड करा",
    currentRisk: "सध्याचा धोका",
    score: "गुण",
    explainability: "स्पष्टीकरण",
    modelWeight: "अंतिम धोक्याच्या गुणांसाठी प्रत्येक वैशिष्ट्याचे वजनदार योगदान.",
    trend: "६-तासांचा पावसाचा कल (मिमी)",
    nearestSafer: "जवळचा सुरक्षित विभाग",
    confidence: "मॉडेल आत्मविश्वास"
  }
};

export function t(key, lang = 'en') {
  return dict[lang][key] || key;
}
