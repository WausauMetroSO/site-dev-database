window.addEventListener('load', async function () {
    let debounceTimer

    // Constants
    const apiUrl = 'api-dev.wausaumetroso.org'

    // Body event catches
    this.document.body.addEventListener('submit', async function(e) {
        if (e.target && e.target.id === 'new-athlete-modal-form') {
            e.preventDefault()
        }
    })

    this.document.body.addEventListener('post-athlete_response', function (e) {
        document.getElementById('new-athlete-modal').style.display = 'none'
        const container = document.getElementById('new-athlete-modal-container')
        container.innerHTML = '<progress id="new-athlete-modal-progress"></progress>';
        container.classList.add('is-center')
    })

    this.document.body.addEventListener('delete-athlete_response', function (e) {
        const row = document.getElementById(`athlete-details-${e.detail.value}`)

        if (row) {
            row.classList.add('hidden')
            row.remove()
        }

        const search = document.getElementById('search')
        search.value = ''

        window.location.reload()
    })

    // Clerk session verify
    await Clerk.load()

    if (Clerk.user) {
        const userButtonDiv = document.getElementById('user-button')
        Clerk.mountUserButton(userButtonDiv)

        htmx.ajax('GET', `https://${apiUrl}/athletes`, {
            target: '#athlete-table',
            headers: { 'Authorization': 'Bearer ' + await Clerk.session.getToken() }
        })
    } else {
        window.location.href = '/login.html'
        return;
    }

    // Search
    this.document.getElementById('search').addEventListener('input', (e) => {
        clearTimeout(debounceTimer)

        debounceTimer = setTimeout(async () => {
            e.target.dispatchEvent(new CustomEvent('search-athlete-query', {
                bubbles: true,
                detail: {
                    token: `Bearer ${await Clerk.session.getToken()}`,
                    value: e.target.value
                }
            }))
        }, 500)
    })

    // Toggle Athlete Data & Delete Athlete
    this.document.getElementById('athlete-table').addEventListener('click', async function(event) {
        if (event.target.dataset.action === 'delete') {
            event.target.dispatchEvent(new CustomEvent('delete-athlete-clicked', {
                bubbles: true,
                detail: {
                    token: `Bearer ${await Clerk.session.getToken()}`
                }
            }))
        } else {
            const row = event.target.closest('.athlete-row')

            if (row) {
                const athleteId = row.dataset.athleteId
                window.location.href = `/athlete.html?id=${athleteId}`
            }
        }
    })

    this.document.getElementById('athlete-table').addEventListener('athlete-row-clicked', function(event) {
        const id = event.detail.id

        const row = document.getElementById(`athlete-details-${id}`)
        row.classList.toggle('hidden')
    })

    // New athlete form
    this.document.getElementById('add-new-button').addEventListener('click', async function(event) {
        const button = event.target.closest('button')

        if (button) {
            button.dispatchEvent(new CustomEvent('add-new-button-clicked', {
                bubbles: true,
                detail: {
                    token: `Bearer ${await Clerk.session.getToken()}`
                }
            }))
        }
    })

    this.document.addEventListener('add-new-button-clicked', function(e) {
        const modal = document.getElementById('new-athlete-modal');
        modal.style.display = 'flex';
    })

    this.document.getElementById('new-athlete-modal').addEventListener('click', async function(e) {
        if (
            e.target.classList.contains('new-athlete-modal__overlay') ||
            e.target.classList.contains('new-athlete-modal__close')
        ) {
            this.style.display = 'none';
            const container = document.getElementById('new-athlete-modal-container')
            container.innerHTML = '<progress id="new-athlete-modal-progress"></progress>';
            container.classList.add('is-center')
        }

        if (e.target.id === 'add-athlete') {
            e.target.dispatchEvent(new CustomEvent('post-athlete', {
                bubbles: true,
                detail: {
                    token: `Bearer ${await Clerk.session.getToken()}`
                }
            }))
        }
    })
})