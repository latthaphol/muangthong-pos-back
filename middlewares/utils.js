const _check_field = async (req, fields, obj = {}) => {
    let object = { ...obj }
    let missing = []
    await Promise.all(await fields.map(async (it) => {
        if (req.body[it]) {
            object = { ...object, [it]: req.body[it] }
        } else {
            missing.push(it)
        }
    }))
    const ret = { object, missing }
    return ret
}

exports.check_field = _check_field 