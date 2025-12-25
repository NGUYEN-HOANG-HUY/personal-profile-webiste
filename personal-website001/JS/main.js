const button = document.getElementById("btnHello");
const message = document.getElementById("message");

button.addEventListener("click", function () {
  message.innerText = "🎉 Bạn đã click nút thành công!";
});
