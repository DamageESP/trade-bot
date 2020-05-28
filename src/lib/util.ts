export const timeStamp = (epoch = Date.now()): string => {
    const now = new Date(epoch)
    const date = [ String(now.getDate()).padStart(2, '0'), String(now.getMonth() + 1).padStart(2, '0'), String(now.getFullYear()).padStart(2, '0') ];
    const time = [ String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0'), String(now.getSeconds()).padStart(2, '0') ];

    // Return the formatted string
    return "[" + date.join("/") + " " + time.join(":") + "]"
}
