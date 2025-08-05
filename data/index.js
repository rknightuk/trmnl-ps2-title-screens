import fs from 'fs'
import { DOMParser, parseHTML } from 'linkedom'

const pages = [
    'https://tcrf.net/Category:PlayStation_2_title_screens',
    'https://tcrf.net/index.php?title=Category:PlayStation_2_title_screens&filefrom=Dark+Summit+-+Title.png#mw-category-media',
    'https://tcrf.net/index.php?title=Category:PlayStation_2_title_screens&filefrom=Growlanser+IV+-+Title.png#mw-category-media',
    'https://tcrf.net/index.php?title=Category:PlayStation_2_title_screens&filefrom=Lethal+Skies+II+-+Title.png#mw-category-media',
    'https://tcrf.net/index.php?title=Category:PlayStation_2_title_screens&filefrom=Pachi-Slot+Gigazone+-+Title.png#mw-category-media',
    'https://tcrf.net/index.php?title=Category:PlayStation_2_title_screens&filefrom=Shin+Seiki+GPX+Cyber+Formula+-+Title.png#mw-category-media',
    'https://tcrf.net/index.php?title=Category:PlayStation_2_title_screens&filefrom=TheKingofRoute66PS2-title.png#mw-category-media',
]

const fetchPageHtml = async (link) => {
    const domain = new URL(link).origin
    const page = await fetch(link)
    const html = await page.text()

    const { document } = parseHTML(html)

    return document
}

if (!fs.existsSync('file-links.json')) {
    let files = []

    for (const page of pages) {
        const fileDocument = await fetchPageHtml(page)

        files = [
            ...files,
            ...Array.from(fileDocument.querySelectorAll('.thumb a')).map(a => a.href)
        ]
    }

    fs.writeFileSync('file-links.json', JSON.stringify(files, null, 2));   
}

const fileLinks = JSON.parse(fs.readFileSync('file-links.json', 'utf-8'))

let rawLinks = []
for (const link of fileLinks) {
    console.log(`Fetching link: ${link}`)
    const linkDocument = await fetchPageHtml(`https://tcrf.net${link}`)

    try {
        rawLinks.push(`https://tcrf.net${linkDocument.getElementsByClassName('internal')[0].href}`)
    } catch (e) {
        console.error(`Failed to fetch link for ${link}:`, e)
    }

    await new Promise(r => setTimeout(r, 500));
}

fs.writeFileSync('./images/files.txt', rawLinks.join('\n'))