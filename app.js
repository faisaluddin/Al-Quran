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
const nextSurahBtn = document.getElementById("next");
const previousSurahBtn = document.getElementById("previous");
const modal = document.querySelector(".modal");
const closeModal = document.querySelector("#close");
const ayahAudio = [];
let index = 1;
let currentSurahIndex = 1;

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
  let ayahOptions =
    "<input placeholder='filter' id='filter-ayah' class='filter'>";
  const bismillah = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ";
  jsonRes.data.ayahs.forEach((a, i) => {
    let currentAyah = a.text;
    if (i === 0 && surahNumber != 1) {
      currentAyah = currentAyah.replace(bismillah, "");
    }
    templateString += `
    <div id=ayah${a.numberInSurah} class="ayah-wrapper">
    <span class="arabic-ayah font-kitab"> ${currentAyah}</span> 
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
  currentSurahIndex = jsonRes.data.number;

  ayahContainer.innerHTML = templateString;
  ayahDD.innerHTML = ayahOptions;
  document.getElementById("filter-ayah").addEventListener("input", filterAyah);

  spinner.removeAttribute("style");
  document.querySelector(".container").style.paddingTop =
    navigations.offsetHeight + 4 + "px";
  document.documentElement.style.scrollPaddingTop =
    navigations.offsetHeight + 4 + "px";

  if (currentSurahIndex == 1) {
    previousSurahBtn.disabled = true;
    nextSurahBtn.removeAttribute("disabled");
  } else if (currentSurahIndex === 114) {
    nextSurahBtn.disabled = true;
    previousSurahBtn.removeAttribute("disabled");
  } else {
    previousSurahBtn.removeAttribute("disabled");
    nextSurahBtn.removeAttribute("disabled");
  }
}

async function getSurahs() {
  const res = await fetch("https://api.alquran.cloud/v1/meta");
  jsonRes = await res.json();
  const surahs = jsonRes.data.surahs.references;

  let templateString =
    "<input placeholder='filter' id='filter-surah' class='filter'>";
  surahs.forEach(s => {
    templateString += `<a href="#${s.number}" >${s.number}. ${s.englishName} (${s.englishNameTranslation})</a>`;
  });

  surahDD.innerHTML = templateString;
  document
    .getElementById("filter-surah")
    .addEventListener("input", filterSurah);
}

function getNewSurah(e) {
  if (!e.target.id) {
    e.preventDefault();
    getData(e.target.href.split("#")[1]);
  }
}

function goToAyah(e) {
  if (!e.target.id) {
    ayahDD.style.display = "none";
  }
}

function showAyahDropdown() {
  ayahDD.removeAttribute("style");
}

function showSurahDropdown() {
  surahDD.removeAttribute("style");
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

function nextSurah() {
  getData(currentSurahIndex + 1);
}

function previousSurah() {
  getData(currentSurahIndex - 1);
}

function filterSurah(e) {
  const text = e.target.value.toLocaleLowerCase();
  Array.from(surahDD.children).forEach(c => {
    c.nodeName === "INPUT" ||
    c.textContent.toLocaleLowerCase().indexOf(text) != -1
      ? (c.style.display = "")
      : (c.style.display = "none");
  });
}

function filterAyah(e) {
  const text = e.target.value.toLocaleLowerCase();
  Array.from(ayahDD.children).forEach(c => {
    c.nodeName === "INPUT" ||
    c.textContent.toLocaleLowerCase().indexOf(text) != -1
      ? (c.style.display = "")
      : (c.style.display = "none");
  });
}

function show(elem) {
  elem.classList.add("is-visible");
  document.body.style.overflow = "hidden";
}

function hide() {
  modal.classList.remove("is-visible");
  document.body.removeAttribute("style");
}

function closeModalOnEscape(e) {
  if (e.key === "Escape") hide();
}

function loadEventListener() {
  surahDD.addEventListener("click", getNewSurah);
  ayahDD.addEventListener("click", goToAyah);
  goToAyahBtn.addEventListener("mouseover", showAyahDropdown);
  currentSurah.addEventListener("mouseover", showSurahDropdown);
  surahPlayer.addEventListener("ended", playCompleteSurah);
  nextSurahBtn.addEventListener("click", nextSurah);
  previousSurahBtn.addEventListener("click", previousSurah);
  closeModal.addEventListener("click", hide);
  document.addEventListener("keyup", closeModalOnEscape);
}

window.onresize = () => {
  document.querySelector(".container").style.paddingTop =
    navigations.offsetHeight + 4 + "px";
  document.documentElement.style.scrollPaddingTop =
    navigations.offsetHeight + 4 + "px";
};

window.onload = () => {
  show(modal);
  document.documentElement.style.scrollPaddingTop = "50px";
  getSurahs();
  getData(1);
  loadEventListener();
};
