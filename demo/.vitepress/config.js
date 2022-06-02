module.exports = {
    title: 'avplayer',
    description: '一款纯H5直播流播放器',
    themeConfig: {
        repo: "tdcr5/avplayer",
        docsBranch: "mater",
        sidebar: "auto",
        nav: [
            {text: 'API', link: '/api'},
            { text: 'DEMO', link: '/demo' },
            {text: 'Document', link: '/document'},
            {text: 'HTTP', link: 'http://jessibuca.monibuca.com/'},
            {text: 'HTTPS', link: 'https://j.m7s.live/'},
        ],
        logo: 'logo.png',
    },
    head: [
        ['script', {src: '/jessibuca.js'}],
        ['script', {src: '/vconsole.js'}]
    ]
}
