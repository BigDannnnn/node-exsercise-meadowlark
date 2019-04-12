var fortunesCookies = [
    "conquer your fears or they will conque you",
    "river need springs",
    "do not fear what you don't know",
    "whenever possible, keep it simple",
]

exports.getFortune = function () {
    var idx = Math.floor(Math.random() * fortunes.length)
    return fortunesCookies[idx];
}