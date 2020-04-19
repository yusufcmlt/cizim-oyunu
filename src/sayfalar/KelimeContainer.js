import React from "react";

export default function KelimeContainer({ siradakiOyuncu, oyuncuID, kelime }) {
  return (
    <p className="h4">
      {siradakiOyuncu === oyuncuID ? kelime : kelime.replace(/[\S]/g, "_")}
    </p>
  );
}
