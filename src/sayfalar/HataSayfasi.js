//Basit hata sayfasi componenti
//Oyuncular ulasmak istedikleri oyunun olmamasi durumunda bu sayfaya yonlendirilir.
//Bu sayfadan 3.5 saniye sonra ana sayfaya yonlendirilirler.
import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { socket } from "../oyun-ogeleri/socketExport";
const siteDiliJson = require("../oyun-ogeleri/oyun-dil.json");

export default function HataSayfasi(props) {
  const LOCATION_REF = props.location.state;
  const [anasayfaYonlendir, setYonlendir] = useState(false);
  const [siteDili] = useState(LOCATION_REF ? LOCATION_REF.siteDili : "tr");
  const SITE_DIL = siteDiliJson[`oyun-dil_${siteDili}`];
  //Sayfanin renderi sonrasi 3.5 saniye beklenmesi ve yonlendirme state inin degistirilmesi.
  useEffect(() => {
    setTimeout(() => {
      setYonlendir(true);
    }, 4000);
  }, []);
  //Ana sayfaya yonlendirilme durumu.
  if (anasayfaYonlendir) {
    socket.disconnect();
    return <Redirect to={{ pathname: "/", state: { siteDili: siteDili } }} />;
  }
  return (
    <div className="container-fluid d-flex vh-100 align-items-center  justify-content-center bg-warning">
      <div id="hata-container" className="my-auto text-center">
        <p id="hata-baslik" style={{ fontSize: "150px" }}>
          ( ͡° ͜ʖ ͡°)
        </p>
        <p id="hata-aciklama-mesaj" className="h5">
          {SITE_DIL["wrong_page_message"]}
        </p>
        <p id="hata-yonlendirme-mesaj" className="text-muted h5">
          {SITE_DIL["return_homepage_message"]}
        </p>
      </div>
    </div>
  );
}
