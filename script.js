const translations = {
  en: {
    name: "Emin Enes Oğuz",
    location: "Istanbul, Turkey",
    educationTitle: "Education",
    experienceTitle: "Experience",
    skillsTitle: "Skills & Interests",
    certificatesTitle: "Certificates",
    contactTitle: "📬 Send a Message",
    education: [
      "Kadir Has University - B.Sc. in Computer Engineering (2020–2025)",
      "Bursa BIST Fen Lisesi (2014–2019)",
      "Bursa Şahinkaya Fen Lisesi"
    ],
    experience: [
      "Renault Turkey – IT Intern (2023–2025)",
      "Huawei – Software Development Intern (2023)",
      "PSM Zorlu – Translator & Guide (2022)",
      "KHAS YEP – IT Intern (2021–2023)"
    ],
    skills: [
      "Languages: C++, C, Python, Flutter, Java, SpringBoot",
      "Tools: Oracle DB, FortiNet, Simulink, Power BI",
      "Languages: English (B2)",
      "Interests: AI, ML, Web Dev, DB Management, NLP"
    ],
    certificates: [
      "Python for Data Science – IBM",
      "AI and Ethics – Renault Turkey",
      "Git & GitHub – Google",
      "Career Path Essentials – IESE",
      "Spaceflight – University of Houston",
      "Project Management – Google",
      "Game Jam – Google"
    ]
  },
  tr: {
    name: "Emin Enes Oğuz",
    location: "İstanbul, Türkiye",
    educationTitle: "Eğitim",
    experienceTitle: "Deneyim",
    skillsTitle: "Yetenekler ve İlgi Alanları",
    certificatesTitle: "Sertifikalar",
    contactTitle: "📬 Mesaj Gönder",
    education: [
      "Kadir Has Üniversitesi - Bilgisayar Mühendisliği Lisans (2020–2025)",
      "Bursa BIST Fen Lisesi (2014–2019)",
      "Bursa Şahinkaya Fen Lisesi"
    ],
    experience: [
      "Renault Turkey – BT Stajyeri (2023–2025)",
      "Huawei – Yazılım Geliştirme Stajyeri (2023)",
      "PSM Zorlu – Tercüman & Rehber (2022)",
      "KHAS YEP – BT Stajyeri (2021–2023)"
    ],
    skills: [
      "Diller: C++, C, Python, Flutter, Java, SpringBoot",
      "Araçlar: Oracle DB, FortiNet, Simulink, Power BI",
      "Yabancı Dil: İngilizce (B2)",
      "İlgi Alanları: YZ, ML, Web, VT Yönetimi, NLP"
    ],
    certificates: [
      "Python for Data Science – IBM",
      "AI and Ethics – Renault Turkey",
      "Git & GitHub – Google",
      "Kariyer Planlama – IESE",
      "Uzay Uçuşları – Houston Üniversitesi",
      "Proje Yönetimi – Google",
      "Game Jam – Google"
    ]
  }
};

function changeLang(lang) {
  localStorage.setItem("lang", lang);
  applyTranslation(lang);
}

function applyTranslation(lang) {
  const t = translations[lang];
  document.getElementById("name").textContent = t.name;
  document.getElementById("location").textContent = t.location;
  document.getElementById("education-title").textContent = t.educationTitle;
  document.getElementById("experience-title").textContent = t.experienceTitle;
  document.getElementById("skills-title").textContent = t.skillsTitle;
  document.getElementById("certificates-title").textContent = t.certificatesTitle;
  document.getElementById("contact-title").textContent = t.contactTitle;

  const updateList = (id, items) => {
    const ul = document.getElementById(id);
    ul.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
  };

  updateList("education", t.education);
  updateList("experience", t.experience);
  updateList("skills", t.skills);
  updateList("certificates", t.certificates);
}

function toggleDarkMode() {
  const html = document.documentElement;
  const currentTheme = html.dataset.theme;
  const newTheme = currentTheme === "light" ? "dark" : "light";
  html.dataset.theme = newTheme;
  localStorage.setItem("theme", newTheme);
  document.body.classList.toggle("dark", newTheme === "dark");
}

window.onload = () => {
  const savedLang = localStorage.getItem("lang") || "en";
  changeLang(savedLang);

  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.dataset.theme = savedTheme;
  document.body.classList.toggle("dark", savedTheme === "dark");
};
