const ayahContainer = document.querySelector(".ayah-container");
const surahDD = document.querySelector("#surah-options");
const ayahDD = document.querySelector("#ayah-options");
const numberOfAyah = document.getElementById("no-of-ayah");
const revelationType = document.getElementById("revelation-type");
const dropdownContent = document.querySelector(".dropdown-content");
const currentSurah = document.getElementById("current-surah");
const spinner = document.querySelector(".spinner");
const goToAyahBtn = document.getElementById("goto-ayah");
const surahPlayer = document.getElementById("surah-audio");
const surahPlayerSrc = document.querySelector("#surah-audio source");
const navigations = document.querySelector(".navbar");
const ayahAudio = [];
let index = 1;

async function getData(surahNumber) {
  index = 1;
  spinner.style.opacity = 1;
  ayahContainer.innerHTML = "";
  numberOfAyah.innerText = "";
  revelationType.innerText = "";
  surahDD.style.display = "none";

  const translatedRes = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`
  );
  translatedJsonRes = await translatedRes.json();

  const res = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani-quran-academy`
  );
  jsonRes = await res.json();

  let templateString = "";
  let ayahOptions = "";
  jsonRes.data.ayahs.forEach((a, i) => {
    templateString += `
    <div id=ayah${a.numberInSurah} class="ayah-wrapper">
  
    <span class="arabic-ayah font-kitab"> ${a.text}</span> 
    <span class="ayah-number"> ${a.numberInSurah}</span> 
    <p class="translation">${translatedJsonRes.data.ayahs[i].text}</p>
    <audio id="ayah-audio" width="1" controls="" preload="none">
    <source
      src="https://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/${a.number}/high"
      type="audio/mpeg"
    />
  </audio>
    </div>
    `;

    ayahOptions += `<a href=#ayah${a.numberInSurah}> ${a.numberInSurah}</a>`;
  });

  const audioRes = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`
  );

  jsonAudioRes = await audioRes.json();

  ayahAudio.length = 0;
  jsonAudioRes.data.ayahs.forEach(a => {
    ayahAudio.push(a.audio);
  });
  surahPlayerSrc.src = ayahAudio[0];
  surahPlayer.pause();
  surahPlayer.load();

  numberOfAyah.innerText = `Number of Ayahs: ${jsonRes.data.numberOfAyahs}`;
  revelationType.innerText = `Revelation: ${jsonRes.data.revelationType}`;
  currentSurah.innerHTML = `${jsonRes.data.englishName} (${jsonRes.data.englishNameTranslation})
  <i>&#9660</i>`;

  ayahContainer.innerHTML = templateString;
  ayahDD.innerHTML = ayahOptions;

  spinner.removeAttribute("style");
  document.querySelector(".container").style.paddingTop =
    navigations.offsetHeight + 4 + "px";
}

async function getSurahs() {
  const res = await fetch("https://api.alquran.cloud/v1/meta");
  jsonRes = await res.json();
  const surahs = jsonRes.data.surahs.references;

  let templateString = "";
  surahs.forEach(s => {
    templateString += `<a href="#${s.number}" > ${s.englishName} (${s.englishNameTranslation})</a>`;
  });

  surahDD.innerHTML = templateString;
}

function getNewSurah(e) {
  e.preventDefault();
  getData(e.target.href.split("#")[1]);
}

function goToAyah(e) {
  ayahDD.style.display = "none";
}

function showAyahDropdown() {
  ayahDD.removeAttribute("style");
}

function showSurahDropdown() {
  surahDD.removeAttribute("style");
}

function loadEventListener() {
  surahDD.addEventListener("click", getNewSurah);
  ayahDD.addEventListener("click", goToAyah);
  goToAyahBtn.addEventListener("mouseover", showAyahDropdown);
  currentSurah.addEventListener("mouseover", showSurahDropdown);
  surahPlayer.addEventListener("ended", playCompleteSurah);
}

function playCompleteSurah() {
  if (index < ayahAudio.length) {
    if (index === 0) index += 1;
    surahPlayerSrc.src = ayahAudio[index];
    location.href = location.href.split("/")[0] + "#ayah" + (index + 1);
    surahPlayer.load();
    surahPlayer.play();
    index += 1;
  } else {
    index = 0;
    surahPlayerSrc.src = ayahAudio[index];
    surahPlayer.load();
  }
}

window.onresize = () => {
  document.querySelector(".container").style.paddingTop =
    navigations.offsetHeight + 4 + "px";
};

window.onload = () => {
  getSurahs();
  getData(1);
  loadEventListener();
};
