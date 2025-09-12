window.addEventListener('load', async function () {
    // Constants
    const apiUrl = 'api-dev.wausaumetroso.org'

    // Utils
    const setEditMode = (athleteId, isEditing) => {
        const url = new URL(this.window.location)
        url.searchParams.set('id', athleteId)
        if (isEditing) {
            url.searchParams.set('edit', 'true')
        } else {
            url.searchParams.delete('edit')
        }
        this.window.history.replaceState({}, '', url)
    }

    // Body event catches
    this.document.body.addEventListener('click', async (e) => {
        if (e.target.id === 'edit-athlete-button') {
            const editButton = e.target
            const athleteId = editButton.dataset.athleteId

            editButton.dispatchEvent(new CustomEvent('edit-athlete-button-clicked', {
                bubbles: true,
                detail: {
                    token: `Bearer ${await Clerk.session.getToken()}`
                }
            }))

            setEditMode(athleteId, true)
        }

        if (e.target.id === 'cancel-edit-athlete-button') {
            const editButton = e.target
            const athleteId = editButton.dataset.athleteId

            editButton.dispatchEvent(new CustomEvent('cancel-edit-athlete-button-clicked', {
                bubbles: true,
                detail: {
                    token: `Bearer ${await Clerk.session.getToken()}`
                }
            }))

            setEditMode(athleteId, false)
        }

        if (e.target.id === 'delete-athlete-button') {
            const deleteButton = e.target

            deleteButton.dispatchEvent(new CustomEvent('delete-athlete-clicked', {
                bubbles: true,
                detail: {
                    token: `Bearer ${await Clerk.session.getToken()}`
                }
            }))
        }
    })

    this.document.body.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'edit-athlete-form') {
            e.preventDefault()

            e.target.dispatchEvent(new CustomEvent('put-athlete', {
                bubbles: true,
                detail: {
                    token: `Bearer ${await Clerk.session.getToken()}`
                }
            }))
        }
    })

    this.document.body.addEventListener('delete-athlete_response', () => {
        this.window.location.href = '/index.html'
    })

    // Clerk session verify
    await Clerk.load()

    if (Clerk.user) {
        const urlParams = new URLSearchParams(window.location.search);
        const athleteId = urlParams.get('id');

        if (athleteId) {
            const userButtonDiv = document.getElementById('user-button')
            Clerk.mountUserButton(userButtonDiv)

            htmx.ajax('GET', `https://${apiUrl}/athletes/${athleteId}`, {
                target: '#athlete-details',
                swap: 'outerHTML',
                headers: { 'Authorization': 'Bearer ' + await Clerk.session.getToken() }
            })

        } else {
            window.location.href = '/index.html'
        }
    } else {
        window.location.href = '/login.html'
        return;
    }

    // Back button
    this.document.getElementById('back').addEventListener('click', () => {
        this.window.location.href = '/index.html'
    })
})
