document.addEventListener('DOMContentLoaded', () => {

    const grid = document.getElementById('rosterGrid')

    const render = list => {
        grid.innerHTML = ''

        list.forEach(p => {

            const col = document.createElement('div')

            col.className = 'col-6 col-lg-2'


            col.innerHTML = `
           <div class="card h-100 shadow-sm">
                <img src="${p.photo}" class="card-img-top" alt="${p.firstName} ${p.lastName}">
                <div class="card-body text-center">
                    <h5 class="card-title mb-1">${p.firstName} ${p.lastName}
                    </h5>
                    <div class='badg badge-position badge-pos-${p.realName}'>Real Name: ${p.realName}
                    </div>
                    <p class="small text-muted mb-0">Signurature Weapon: ${p.weapon}
                    </p>
                    </div>
                </div>
            `




            grid.appendChild(col)




        })

    }









    render(players)
})