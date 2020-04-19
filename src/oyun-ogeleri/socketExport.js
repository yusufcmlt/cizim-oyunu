//Bu modul socket baglantisinin istenilen
//component icerisinde kullanilmasi icin olusturuldu.
import io from "socket.io-client";
//Socket server tanimi ve socketin tanimi
const ENDPOINT = "161.35.90.203:5000";
const socket = io(ENDPOINT);

export { socket };
