function updateUrl(url?: string) {
    console.log(url);

    if (url != "" && url != undefined) {
        let splitUrl = url?.split('/')
        try {
            if (splitUrl[2] == 's3-ap-south-1.amazonaws.com') {
                const gcpUrl = url.replace("s3-ap-south-1.amazonaws.com/flam-videoshop-assets", "zingcam.cdn.flamapp.com");
                console.log(gcpUrl);
                return gcpUrl
            }
            else if (splitUrl[2] == 'flam-videoshop-assets.s3.ap-south-1.amazonaws.com') {
                const gcpUrl = url.replace("flam-videoshop-assets.s3.ap-south-1.amazonaws.com", "zingcam.cdn.flamapp.com");
                console.log(gcpUrl);
                return gcpUrl
            }
            else if (splitUrl[2] == 'saas-assets.flamapp.com') {
                const gcpUrl = url.replace("saas-assets.flamapp.com", "zingcam.cdn.flamapp.com");
                console.log(gcpUrl);
                return gcpUrl
            }
            else
                return url

        } catch (err) {
            console.log(err);

        }
    }
    else
        return url
}

export {updateUrl};
