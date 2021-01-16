module.exports = class Entity {
    constructor (id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    equals (other) {
        if (!(other instanceof Entity)) {
            return false
        }

        return other._id
            ? this.referenceEquals(other._id)
            : this === other
    }

    referenceEquals (id) {
        if (!this._id) {
            // Try object equality
            return this.equals(id)
        }

        const reference = typeof id !== 'string'
            ? id.toString()
            : id

        return this._id === reference
    }

    toString () {
        return this._id
    }
}