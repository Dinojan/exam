import { Toast } from './toast.js';

window.typeNIC = function (inputId) {
    let searchInput = $("#" + inputId);

    searchInput.on("input", function (e) {
        let value = this.value;
        let cursorPosition = this.selectionStart;

        let raw = value.replace(/\s+/g, "");
        let newValue = "";

        if (/^\d/.test(raw)) {
            if (raw.length <= 10) {
                let first9 = raw.slice(0, 9);
                let tenthChar = raw.charAt(9) || "";

                if (/^\d{9}$/.test(first9)) {
                    if (/^[xXyYvV]$/.test(tenthChar)) {
                        raw = first9 + tenthChar.toUpperCase();
                    } else if (/^\d$/.test(tenthChar)) {
                        raw = first9 + tenthChar;
                    } else {
                        raw = first9;
                    }
                }
            } else {
                raw = raw.slice(0, 12).replace(/[^\d]/g, "");
            }

            if (raw.length > 0) {
                newValue = raw.slice(0, 4);
                if (raw.length > 4) newValue += " " + raw.slice(4, 8);
                if (raw.length > 8) newValue += " " + raw.slice(8);
            }
        } else {
            newValue = value;
        }

        this.value = newValue;

        let countSpacesBefore = (
            value.slice(0, cursorPosition).match(/\s/g) || []
        ).length;
        let countSpacesAfter = (
            newValue.slice(0, cursorPosition).match(/\s/g) || []
        ).length;
        let diff = countSpacesAfter - countSpacesBefore;
        this.selectionStart = this.selectionEnd = cursorPosition + diff;
    });
};

// Return url parameter/query string
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getIdFromUrl(indexFromEnd = 1, url) {
    const fullUrl = url || window.location.href;
    const pathParts = new URL(fullUrl).pathname.split('/').filter(Boolean);
    const idStr = pathParts[pathParts.length - indexFromEnd];

    // Check if it's a number
    const id = parseInt(idStr, 10);
    return isNaN(id) ? null : id;
}

function getParameterFromUrl(indexFromEnd = 1, url) {
    const fullUrl = url || window.location.href;
    const pathParts = new URL(fullUrl).pathname.split('/').filter(Boolean);
    const para = pathParts[pathParts.length - indexFromEnd];
    return para;
}

function getPathAfterBase() {
    const baseUrl = window.baseUrl
    const fullUrl = window.location.href;
    return fullUrl.replace(baseUrl, '') || '/';
}

window.getParameterByName = getParameterByName;
window.getIdFromUrl = getIdFromUrl;
window.getParameterFromUrl = getParameterFromUrl;
window.getPath = getPathAfterBase;
//Initialize Select2 Elements
$('.select2').select2()