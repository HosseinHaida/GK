exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(() =>
      knex("users").insert([
        {
          email: "squanderness@gmail.com",
          username: "illiterateme",
          password_hash:
            "$2a$10$FeqkWFlhSAWYzihpiG.GL.MOk3p7.zsDLL3L8QgTKb1pH/p.PkkDK",
          verified: true,
          is_admin: true,
          phone: "09366188190",
          first_name: "Hossein",
          last_name: "Heidari",
          photo: "",
          subscription: "wheat",
          subscribed_at: "2023-02-15 10:00:00",
          suscription_period: "1mo",
          subscription_counts: "{'seed:2', 'bud:1', 'weat:3'}",
          last_download_at: "2023-03-12 08:38:50.369-07",
          sheba: "IR1200000000007887900854",
          bio: `I Love Icons`,
          gender: "male",
          city: "Esfahan",
          created_at: "2022-08-29 10:00:00",
          updated_at: null,
          updated_by: null,
        },
        {
          email: "schmaltziness@gmail.com",
          username: "crackerjoe",
          password_hash:
            "$2a$10$FeqkWFlhSAWYzihpiG.GL.MOk3p7.zsDLL3L8QgTKb1pH/p.PkkDK",
          verified: true,
          is_admin: false,
          phone: "09366188190",
          first_name: "Hosseine",
          last_name: "Heidari",
          photo: "",
          subscription: "bud",
          subscribed_at: "2023-02-15 10:00:00",
          suscription_period: "3mo",
          subscription_counts: "{'seed:3', 'bud:2', 'weat:4'}",
          last_download_at: "2023-03-12 08:35:50.369-07",
          last_download_at: "2023-03-02 10:00:00",
          sheba: "232300000000008900786548",
          bio: `I Love Lionesses`,
          gender: "female",
          city: "Teh",
          created_at: "2022-08-29 10:00:00",
          updated_at: null,
          updated_by: null,
        },
      ])
    )
}
