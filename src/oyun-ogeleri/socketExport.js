//Bu modul socket baglantisinin istenilen
//component icerisinde kullanilmasi icin olusturuldu.
import io from "socket.io-client";
//Socket server tanimi ve socketin tanimi
const ENDPOINT = "https://cizim-oyunu-server.herokuapp.com/";
const socket = io(ENDPOINT);

export { socket };
