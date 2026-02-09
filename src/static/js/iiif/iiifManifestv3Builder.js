


/**
 * @param {string} gamsProductionOrigin production address of gams5 
 * @param {string} gamsApiOrigin Origin of the gams-api 
 * @param {string} iiifServerOrigin origin of the iiif server 
 */
const IIIFManifestBuilder = (
    gamsProductionOrigin,
    gamsApiOrigin,
    iiifServerOrigin
) => {
    
    const GAMS_API_ORIGIN = gamsApiOrigin;
    const IIIF_SERVER_ORIGIN = iiifServerOrigin;

    /**
     * Builds a IIIFv3 manifest item to be displayed in an image viewer
     * @param {string} iiifUrl Adress of the IIIF resource  
     * @param {string} label Label of the image to be shown
     * @returns constructed item   
     */
    const createIIIFItem = (iiifUrl, label) => {

        let canvasId = `${gamsProductionOrigin}/api/canvas/${crypto.randomUUID().toString()}`;

        let iiifItem = {
            "id": canvasId,
            "type": "Canvas",
            "label": {
                "de": [
                    label
                ]
            },
            "height": 4613,
            "width": 3204,
            "items": [
                {
                "id": `${gamsProductionOrigin}/api/page/${crypto.randomUUID().toString()}`,
                "type": "AnnotationPage",
                "items": [
                    {
                    "id": `${gamsProductionOrigin}/api/annotation/${crypto.randomUUID().toString()}`,
                    "type": "Annotation",
                    "motivation": "painting",
                    "body": {
                        "id": `${gamsProductionOrigin}/api/image/${crypto.randomUUID().toString()}`,
                        "type": "Image",
                        "format": "image/jpeg",
                        "height": 4613,
                        "width": 3204,
                        "service": [
                        {
                            "id": iiifUrl,
                            "type": "ImageService2",
                            "profile": "level1"
                        }
                        ]
                    },
                    "target": canvasId
                    }
                    ]
                }
            ]
        };


        return iiifItem;

    }

    /**
     * Builds IIIFv3 manifest for the current object.
     * @param {string} projectAbbr project id
     * @param {string} objectId id of the digital object
     */
    const build = async (projectAbbr, objectId) => {

        let url = `${GAMS_API_ORIGIN}/api/v1/projects/memo/objects/${objectId}/datastreams`;
        // fetch datastream info
        let response = await fetch(url);
        let json = await response.json();

        const template = {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": `${gamsProductionOrigin}/api/v1/projects/memo/objects/memo.person.100/datastreams/manifest.json/content`,
            "type": "Manifest",
            "label": {
                "de": [
                "Personen material"
                ]
            },
            "items": []
        }    


        json.results.forEach(datastream => {
            if(!datastream.mimeType.includes("image"))return;
            let dsid = datastream.dsid;
            template.items.push(
                createIIIFItem(
                    `${IIIF_SERVER_ORIGIN}/iiif/2/${projectAbbr}%2f${objectId}%2f${dsid}`,
                    datastream.baseMetadata.title
                )
            );
        });

        return template;
   
    }


    return {
        build
    }

};