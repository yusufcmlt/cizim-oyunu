/**
 * Oyuncu listesinin sayfalar icerisinde kullanilmasi:
 * Bu bir komponent odalara gore oyuncu listelerini tutar
 * Kullanildigi yerlerde oyuncu listesini gosterme amacli olusturulmustur.
 */

import React from "react";
import "./OyuncuListesi.css";
/**
 * Kullanildigi ortamdaki kullanicilar listesi bu komponente gonderilir.
 * Burada kullanici listesi icindeki oyuncu isimleri ve puanlar gosterilebilir.
 * Oyun sirasinin kimde oldugu,puan durumu ve oyun kurucusunun kim oldugu listede gosterilir.
 */
export default function OyuncuListesi({
  kullanicilar,
  oyuncuBen,
  oyunBasladi,
  siradakiOyuncu,
  SITE_DIL,
}) {
  return (
    <div id="oyunculistesi-dis-container">
      {kullanicilar ? (
        <div id="oyunculistesi-ic-container">
          {kullanicilar.map(({ isim, oyuncuID, odaKurucusu, puan }) => (
            <div
              key={oyuncuID}
              id="oyunculistesi-oyuncu-container"
              style={{
                backgroundColor:
                  siradakiOyuncu === oyuncuID
                    ? "#23b223"
                    : "rgba(82, 58, 190, 0.904)",
              }}
            >
              <div id="oyunculistesi-isim">
                {isim}
                {oyuncuID === oyuncuBen ? SITE_DIL["you_message"] : null}
              </div>
              <div id="oyunculistesi-puan">{puan}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
