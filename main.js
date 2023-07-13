"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUrl = void 0;
function updateUrl(url) {
    console.log(url);
    if (url != "" && url != undefined) {
        var splitUrl = url === null || url === void 0 ? void 0 : url.split('/');
        try {
            if (splitUrl[2] == 's3-ap-south-1.amazonaws.com') {
                var gcpUrl = url.replace("s3-ap-south-1.amazonaws.com/flam-videoshop-assets", "zingcam.cdn.flamapp.com");
                console.log(gcpUrl);
                return gcpUrl;
            }
            else if (splitUrl[2] == 'flam-videoshop-assets.s3.ap-south-1.amazonaws.com') {
                var gcpUrl = url.replace("flam-videoshop-assets.s3.ap-south-1.amazonaws.com", "zingcam.cdn.flamapp.com");
                console.log(gcpUrl);
                return gcpUrl;
            }
            else if (splitUrl[2] == 'saas-assets.flamapp.com') {
                var gcpUrl = url.replace("saas-assets.flamapp.com", "zingcam.cdn.flamapp.com");
                console.log(gcpUrl);
                return gcpUrl;
            }
            else
                return url;
        }
        catch (err) {
            console.log(err);
        }
    }
    else
        return url;
}
exports.updateUrl = updateUrl;
