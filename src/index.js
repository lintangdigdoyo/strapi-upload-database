const { Pool } = require("pg")

module.exports = {
  init(providerOptions) {
    const { host, port, database, username, password, schema, table } =
      providerOptions

    const pool = new Pool({
      host: host || "localhost",
      port: Number(port) || 5432,
      database: database || "strapi",
      user: username || "strapi",
      password: password || "strapi",
    })

    return {
      upload(file) {
        return new Promise((resolve, reject) => {
          const { buffer, mime, ext } = file
          const query = `
            INSERT INTO ${table} (file, mime, ext, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id;
          `
          const values = [buffer, mime, ext]

          pool
            .query(query, values)
            .then((res) => {
              file.url = `/uploads/${res.rows[0].id}`
              resolve()
            })
            .catch((err) => reject(err))
        })
      },
      uploadStream(file) {
        // upload the file in the provider
        // file content is accessible by `file.stream`
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          const query = `DELETE FROM ${table} WHERE id = $1;`
          const values = [file.id]

          pool
            .query(query, values)
            .then(() => resolve())
            .catch((err) => reject(err))
        })
      },
      checkFileSize(file, { sizeLimit }) {
        // (optional)
        // implement your own file size limit logic
      },
      getSignedUrl(file) {
        // (optional)
        // Generate a signed URL for the given file.
        // The signed URL allows secure access to the file.
        // Only Content Manager assets will be signed.
        // Returns an object {url: string}.
      },
      isPrivate() {
        // (optional)
        // if it is private, file urls will be signed
        // Returns a boolean
      },
    }
  },
}
