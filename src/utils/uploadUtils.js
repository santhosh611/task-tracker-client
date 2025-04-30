import { supabase } from "./supabaseClient";

const uploadUtils = async (file) => {
    if (!file) return alert("Please select a file");

    const filePath = `tasktracker/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase
        .storage
        .from('tasktracker')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        return;
    }

    const { data } = await supabase
        .storage
        .from('tasktracker')
        .getPublicUrl(filePath);

    console.log("Uploaded file URL:", data.publicUrl);
    return data.publicUrl;
};

export default uploadUtils;