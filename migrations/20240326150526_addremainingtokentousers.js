/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.table('users', function(table) {
        table.integer("remaintoken").defaultTo(1);
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.table('users', function(table) {
        table.dropColumn("remaintoken");
      });
};
