const main = async () => {
    performance.mark('start')
    for(let i = 0; i < 10000; i++) {
    }
    await setTimeout(() => {
        performance.mark('end')
console.log(performance.measure('hh', 'start', 'end'))
    }, 3000)
}

main()