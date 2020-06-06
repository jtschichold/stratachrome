/*! Released under MIT License by Luigi Mori. January 2013. */

(function () {
    var trySSO = function () {
        if (document.querySelector("#login_form") == null) return;
        if (document.querySelector("input[name='user']") == null) return;
        if (document.querySelector("input[name='passwd']") == null) return;

        if (
            document.body.innerHTML.indexOf(
                "__LOGIN_PAGE_FOR_PANORAMA_BACKWARD_COMPATIBILITY__"
            ) != -1
        ) {
            console.log("[Stratachrome] Detected PAN-OS login page");
            chrome.runtime.sendMessage({ cmd: "isalreadymonitored" }, function (
                response
            ) {
                if (!response.result) {
                    document
                        .querySelector("#login_form")
                        .addEventListener("submit", function () {
                            if (confirm("Add to Pan(w)achrome ?")) {
                                var uname = document.querySelector(
                                    "input[name='user']"
                                ).value;
                                var passwd = document.querySelector(
                                    "input[name='passwd']"
                                ).value;

                                chrome.runtime.sendMessage({
                                    cmd: "add",
                                    user: uname,
                                    password: passwd,
                                });
                            }
                        });
                }
            });
            return true;
        }

        return false;
    };

    trySSO();
})();
