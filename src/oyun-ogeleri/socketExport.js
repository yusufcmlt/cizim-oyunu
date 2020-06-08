//Bu modul socket baglantisinin istenilen
//component icerisinde kullanilmasi icin olusturuldu.
import io from "socket.io-client";
//Socket server tanimi ve socketin tanimi
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT;
//const ENDPOINT = "localhost:5000";
const socket = io(ENDPOINT);

export { socket };
