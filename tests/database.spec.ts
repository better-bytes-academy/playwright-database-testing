import { test, expect } from '@playwright/test';
import { DataSource } from 'typeorm';

export type Student = {
    id: number;
    code: string;
    name: string;
    class: string;
    note: string | null;
    created_at: Date;
};

// Khởi tạo kết nối TypeORM
const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'sql12.freesqldatabase.com',
    port: 3306,
    username: 'sql12768026',
    password: 'smbPvrrLfs',
    database: 'sql12768026',
    synchronize: false, // Không cần entity nên không sync
});

test.beforeAll(async () => {
    await AppDataSource.initialize();
});

test.afterAll(async () => {
    await AppDataSource.destroy();
});

test('Database testing', async ({ page }) => {
    // Create data
    const studentData = {
        code: "STUDENT06",
        name: "Minh Phong",
        class: "A102",
        note: "Go first"
    }

    await page.goto("https://material.playwrightvn.com/027-student-register.html");
    await page.fill("//input[@id='code']", studentData.code);
    await page.fill("//input[@id='name']", studentData.name);
    await page.selectOption("//select[@id='class']", studentData.class);
    await page.fill("//textarea[@id='note']", studentData.note);
    await page.click("//button[@type='submit']")
    await page.waitForTimeout(2000); // Chờ 2s để tạo dữ liệu thành công


    // Query data
    const queryRunner = AppDataSource.createQueryRunner();

    // Truy vấn tất cả học sinh
    const query = `SELECT * FROM students where code = '${studentData.code}'`;
    console.log(query);
    const students = await queryRunner.manager.query<Student[]>(query);
    console.log('Dữ liệu học sinh:', students);

    // Verify
    expect(students.length).toBe(1);

    const firstStudent = students[0];

    expect(firstStudent.code).toEqual(studentData.code);
    expect(firstStudent.name).toEqual(studentData.name);
    expect(firstStudent.class).toEqual(studentData.class);
    expect(firstStudent.note).toEqual(studentData.note);
});
