/**
 * Anasayfadaki cizim alani:
 * Herhangi bir amaci yok deneme amacli eklendi
 */

import React, { Component } from "react";
import Sketch from "react-p5";

const CIZIM_X = window.innerWidth < 768 ? 350 : 400;
const CIZIM_Y = window.innerWidth < 768 ? 300 : 350;
let cizimWeight = 1;
let cizimIncrease = true;
let renkSirasi = 0;

//Ekranin kuculme durumuna gore mouse pozisyonunda cizim.
//Cizim alani scale edildiginden pozisyon farkinin ayarlanmasi
let mousePositionMultiplier =
  window.innerWidth < 1400 ? (window.innerWidth < 768 ? 0.8 : 0.75) : 1;
export class CizimAlani extends Component {
  setup = (p5, parent) => {
    p5.createCanvas(CIZIM_X, CIZIM_Y).parent(parent);
    p5.background(255);
  };

  //Mouse suruklenerek beyaz alanda cizim durumu:
  mouseDragged = (p5) => {
    let randomColorList = [
      [52, 107, 235],
      [52, 82, 235],
      [61, 52, 235],
      [255, 51, 0],
      [119, 52, 235],
      [140, 52, 235],
      [183, 52, 235],
    ];
    //Cizimi sadece beyaz alan uzerinde gerceklestirme
    if (
      p5.mouseX <= CIZIM_X &&
      p5.mouseX >= 0 &&
      p5.mouseY <= CIZIM_Y &&
      p5.mouseY >= 0
    ) {
      //Cizimin kalinliginin  surekli artip azalmasi
      if (cizimWeight > 10) cizimIncrease = false;
      else if (cizimWeight < 1) cizimIncrease = true;

      cizimIncrease ? cizimWeight++ : cizimWeight--;

      p5.strokeWeight(cizimWeight);
      p5.stroke(
        randomColorList[renkSirasi][0],
        randomColorList[renkSirasi][1],
        randomColorList[renkSirasi][2]
      );
      renkSirasi++;

      if (renkSirasi === randomColorList.length) {
        renkSirasi = 0;
      }
      p5.line(
        p5.mouseX / mousePositionMultiplier,
        p5.mouseY / mousePositionMultiplier,
        p5.pmouseX / mousePositionMultiplier,
        p5.pmouseY / mousePositionMultiplier
      );
    }
  };

  render() {
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
