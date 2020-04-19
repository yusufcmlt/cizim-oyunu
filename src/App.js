//Cizim oyunu baslangic sayfasi
//2019-2020
//Yusuf Cemal Tokmak
//Bu oyunun arayuzu React ile tasarlanmaya calisilmistir.
//Bu component ana uygulama elemanidir. Diger componentlerin kullanimi ve gecisi bu elemana baglidir.

import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import "./sayfalar/OyunSayfasi.css";
import "./sayfalar/OyunBitis.css";
import AnaSayfa from "./sayfalar/AnaSayfa.js";
import OyunaKatil from "./sayfalar/OyunaKatil.js";
import LobiSayfasi from "./sayfalar/LobiSayfasi.js";
import OyunSayfasi from "./sayfalar/OyunSayfasi";
import HataSayfasi from "./sayfalar/HataSayfasi";
import OyunBitis from "./sayfalar/OyunBitis";

function App() {
  return (
    <Router>
      <Route exact path="/" component={AnaSayfa} />
      <Route path="/oyuna-katil" component={OyunaKatil} />
      <Route path="/oyun-olustur" component={LobiSayfasi} />
      <Route path="/oyun-sayfasi" component={OyunSayfasi} />
      <Route path="/oyun-bitis" component={OyunBitis} />
      <Route path="/404" component={HataSayfasi} />
    </Router>
  );
}

export default App;
