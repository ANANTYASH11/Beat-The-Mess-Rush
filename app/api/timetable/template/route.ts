import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'template';

  if (type === 'example') {
    const csvContent = [
      'block,day_of_week,class_end_time,students_count,building_to_mess_minutes',
      'Block 32,Monday,12:45,320,8',
      'Block 32,Monday,13:00,180,8',
      'Block 34,Monday,12:50,290,10',
      'Block 38,Monday,13:10,240,7',
      'Block 56,Monday,12:40,210,12',
      'Block 32,Wednesday,12:45,340,8',
      'Block 34,Wednesday,12:50,310,10',
      'Block 38,Wednesday,13:00,260,7',
      'Block 56,Wednesday,13:15,190,12',
      'Block 32,Friday,12:30,280,8',
      'Block 34,Friday,12:45,260,10',
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="timetable_example_lpu.csv"',
      },
    });
  }

  // Blank template
  const templateContent = [
    'block,day_of_week,class_end_time,students_count,building_to_mess_minutes',
    'Block 32,Monday,12:50,300,8',
    'Block 34,Monday,13:00,250,10',
  ].join('\n');

  return new NextResponse(templateContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="timetable_template.csv"',
    },
  });
}
