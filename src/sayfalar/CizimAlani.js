import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Sketch from "react-p5";
import { socket } from "../oyun-ogeleri/socketExport";

const CIZIM_X = 600;
const CIZIM_Y = 500;
let mousePositionMultiplier =
  window.innerWidth < 1400 ? 0.75 : window.innerWidth < 1600 ? 0.85 : 1;
export class CizimAlani extends Component {
  setup = (p5, parent) => {
    if (!this.props.redirectToAna) {
      p5.createCanvas(CIZIM_X, CIZIM_Y).parent(parent);
      p5.background(0);
      //console.log(this.props.cizimRengi);
      //Odaya gelen mouse cizim koordinatlarinin cizen kisi disinda alinmasi
      //Koordinatlara gore diger cizim alanlarinda cizimin gosterimi
      //data bilgisi mouse koordinatlaridir.
      socket.on("mouseData", (data) => {
        p5.strokeWeight(2);
        p5.stroke(data.cizimRengi[0], data.cizimRengi[1], data.cizimRengi[2]);
        p5.fill(255, 238, 1);
        p5.line(data.x, data.y, data.px, data.py);
      });
      socket.on("cizimTemizle", function () {
        p5.clear();
      });
    }
  };

  //Mouse suruklenerek beyaz alanda cizim durumu:
  mouseDragged = (p5) => {
    //Mouseun o anda bulundugu koordinatlarin bilgisi
    let cizimData = {
      x: p5.mouseX / mousePositionMultiplier,
      y: p5.mouseY / mousePositionMultiplier,
      px: p5.pmouseX / mousePositionMultiplier,
      py: p5.pmouseY / mousePositionMultiplier,
      cizimRengi: this.props.cizimRengi,
    };
    //Oyuncularin oldugu oda bilgisi

    const odaData = this.props.odaID;
    const siraData = this.props.cizmeSirasi;
    const oyuncuID = this.props.oyuncuID;
    //Cizen kisi tarafindan oda cizim koordinatlari ve oda bilgisinin servera anlik olarak iletilmesi
    if (
      p5.mouseX <= CIZIM_X &&
      p5.mouseX >= 0 &&
      p5.mouseY <= CIZIM_Y &&
      p5.mouseY >= 0 &&
      oyuncuID === siraData
    ) {
      socket.emit("mouse", { cizimData, odaData });
      //Beyaz alanda cizimin yapilmasi
      p5.strokeWeight(2);
      p5.stroke(
        this.props.cizimRengi[0],
        this.props.cizimRengi[1],
        this.props.cizimRengi[2]
      );
      p5.line(
        p5.mouseX / mousePositionMultiplier,
        p5.mouseY / mousePositionMultiplier,
        p5.pmouseX / mousePositionMultiplier,
        p5.pmouseY / mousePositionMultiplier
      );
    }
  };

  render() {
    /**
     * ----Bos sayfa durumunda ana sayfaya yonlendirme----
     * Yonlendirmenin burada kullanilma amaci cizim alaninin hata vermesini onlemektir.
     *
     */
    if (this.props.redirectToAna) {
      return (
        <Redirect
          to={{
            pathname: process.env.PUBLIC_URL + "/",
            state: { siteDili: this.props.siteDili },
          }}
        />
      );
    }
    if (this.props.redirectToHata) {
      return (
        <Redirect
          to={{
            pathname: process.env.PUBLIC_URL + "/404",
            state: { siteDili: this.props.siteDili },
          }}
        />
      );
    }
    return (
      <Sketch
        setup={this.setup}
        draw={this.draw}
        mouseDragged={this.mouseDragged}
      />
    );
  }
}
export default CizimAlani;
