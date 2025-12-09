


const iiifManifestv3Builder = (() => {
    

    /**
     * 
     * @param {string} iiifUrl Adress of the IIIF resource  
     * @returns  
     */
    const createIIIFItem = (iiifUrl) => {

        let canvasId = `https://gams.uni-graz.at/api/canvas/${crypto.randomUUID().toString()}`;

        let iiifItem = {
            "id": canvasId,
            "type": "Canvas",
            "label": {
                "de": [
                    "Blank page"
                ]
            },
            "height": 4613,
            "width": 3204,
            "items": [
                {
                "id": `https://gams.uni-graz.at/api/page/${crypto.randomUUID().toString()}`,
                "type": "AnnotationPage",
                "items": [
                    {
                    "id": `https://gams.uni-graz.at/api/annotation/${crypto.randomUUID().toString()}`,
                    "type": "Annotation",
                    "motivation": "painting",
                    "body": {
                        "id": `https://gams.uni-graz.at/api/image/${crypto.randomUUID().toString()}`,
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
     * TODO
     * @param {*} objectId 
     */
    const build = async (origin, projectAbbr, objectId) => {

        let url = `http://localhost:18085/api/v1/projects/memo/objects/${objectId}/datastreams`;
        // fetch datastream info
        let response = await fetch(url);
        let json = await response.json();

        console.log(json);

        const template = {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": "https://gams.uni-graz.at/api/v1/projects/memo/objects/memo.person.100/datastreams/manifest.json/content",
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
                createIIIFItem(`${origin}/iiif/2/${projectAbbr}%2f${objectId}%2f${dsid}`)
            );

        });

        console.log("Generated manifest: ", template);

        return template;
   
    }


    return {
        build
    }

})();