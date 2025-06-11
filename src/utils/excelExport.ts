
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface FamilyStats {
  totalFamilies: number;
  totalFamilyHeads: number;
  totalSpouses: number;
  totalSons: number;
  totalDaughters: number;
  totalChildren: number;
  totalGrandchildren: number;
  marriedChildren: number;
  occupationBreakdown: Record<string, number>;
  ageGroups: Record<string, number>;
}

export const exportFamilyDataWithCounts = async (password: string) => {
  if (password !== '3575') {
    throw new Error('Invalid password');
  }

  try {
    // Fetch all data
    const [familyHeadsRes, spousesRes, childrenRes, childSpousesRes, grandchildrenRes] = await Promise.all([
      supabase.from('family_heads').select('*'),
      supabase.from('spouses').select('*'),
      supabase.from('children').select('*'),
      supabase.from('child_spouses').select('*'),
      supabase.from('grandchildren').select('*')
    ]);

    if (familyHeadsRes.error) throw familyHeadsRes.error;
    if (spousesRes.error) throw spousesRes.error;
    if (childrenRes.error) throw childrenRes.error;
    if (childSpousesRes.error) throw childSpousesRes.error;
    if (grandchildrenRes.error) throw grandchildrenRes.error;

    const familyHeads = familyHeadsRes.data || [];
    const spouses = spousesRes.data || [];
    const children = childrenRes.data || [];
    const childSpouses = childSpousesRes.data || [];
    const grandchildren = grandchildrenRes.data || [];

    // Calculate statistics
    const stats = calculateFamilyStats(familyHeads, spouses, children, childSpouses, grandchildren);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Family Database Summary', ''],
      ['Export Date', new Date().toLocaleDateString()],
      ['', ''],
      ['OVERALL COUNTS', ''],
      ['Total Families', stats.totalFamilies],
      ['Total Family Heads', stats.totalFamilyHeads],
      ['Total Spouses', stats.totalSpouses],
      ['Total Children', stats.totalChildren],
      ['- Sons', stats.totalSons],
      ['- Daughters', stats.totalDaughters],
      ['Total Married Children', stats.marriedChildren],
      ['Total Grandchildren', stats.totalGrandchildren],
      ['', ''],
      ['OCCUPATION BREAKDOWN', ''],
      ...Object.entries(stats.occupationBreakdown).map(([occupation, count]) => [
        occupation.charAt(0).toUpperCase() + occupation.slice(1), count
      ]),
      ['', ''],
      ['AGE GROUP BREAKDOWN', ''],
      ...Object.entries(stats.ageGroups).map(([ageGroup, count]) => [ageGroup, count])
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Family Heads Sheet
    if (familyHeads.length > 0) {
      const familyHeadsSheet = XLSX.utils.json_to_sheet(familyHeads.map(head => ({
        'First Name': head.first_name,
        'Last Name': head.last_name,
        'Date of Birth': head.date_of_birth,
        'Age': head.age,
        'Contact Number': head.contact_number,
        'Native Place': head.native_place,
        'Current Place': head.current_place,
        'Marital Status': head.marital_status,
        'Occupation': head.occupation,
        'Created At': new Date(head.created_at).toLocaleDateString()
      })));
      XLSX.utils.book_append_sheet(workbook, familyHeadsSheet, 'Family Heads');
    }

    // Spouses Sheet
    if (spouses.length > 0) {
      const spousesSheet = XLSX.utils.json_to_sheet(spouses.map(spouse => ({
        'First Name': spouse.first_name,
        'Last Name': spouse.last_name,
        'Date of Birth': spouse.date_of_birth,
        'Age': spouse.age,
        'Contact Number': spouse.contact_number,
        'Native Place': spouse.native_place,
        'Occupation': spouse.occupation,
        'Number of Sons': spouse.number_of_sons,
        'Number of Daughters': spouse.number_of_daughters,
        'Family Head ID': spouse.family_head_id,
        'Created At': new Date(spouse.created_at).toLocaleDateString()
      })));
      XLSX.utils.book_append_sheet(workbook, spousesSheet, 'Spouses');
    }

    // Children Sheet
    if (children.length > 0) {
      const childrenSheet = XLSX.utils.json_to_sheet(children.map(child => ({
        'Type': child.child_type,
        'Index': child.child_index,
        'First Name': child.first_name,
        'Last Name': child.last_name,
        'Date of Birth': child.date_of_birth,
        'Age': child.age,
        'Contact Number': child.contact_number,
        'Phone Number': child.phone_number,
        'Current Place': child.current_place,
        'Marital Status': child.marital_status,
        'Occupation': child.occupation,
        'Family Head ID': child.family_head_id,
        'Created At': new Date(child.created_at).toLocaleDateString()
      })));
      XLSX.utils.book_append_sheet(workbook, childrenSheet, 'Children');
    }

    // Child Spouses Sheet
    if (childSpouses.length > 0) {
      const childSpousesSheet = XLSX.utils.json_to_sheet(childSpouses.map(spouse => ({
        'First Name': spouse.first_name,
        'Last Name': spouse.last_name,
        'Date of Birth': spouse.date_of_birth,
        'Age': spouse.age,
        'Contact Number': spouse.contact_number,
        'Native Place': spouse.native_place,
        'Occupation': spouse.occupation,
        'Number of Children': spouse.number_of_children,
        'Child ID': spouse.child_id,
        'Created At': new Date(spouse.created_at).toLocaleDateString()
      })));
      XLSX.utils.book_append_sheet(workbook, childSpousesSheet, 'Child Spouses');
    }

    // Grandchildren Sheet
    if (grandchildren.length > 0) {
      const grandchildrenSheet = XLSX.utils.json_to_sheet(grandchildren.map(grandchild => ({
        'Index': grandchild.grandchild_index,
        'First Name': grandchild.first_name,
        'Last Name': grandchild.last_name,
        'Date of Birth': grandchild.date_of_birth,
        'Age': grandchild.age,
        'Contact Number': grandchild.contact_number,
        'Phone Number': grandchild.phone_number,
        'Current Place': grandchild.current_place,
        'Occupation': grandchild.occupation,
        'Child Spouse ID': grandchild.child_spouse_id,
        'Created At': new Date(grandchild.created_at).toLocaleDateString()
      })));
      XLSX.utils.book_append_sheet(workbook, grandchildrenSheet, 'Grandchildren');
    }

    // Generate and download file
    const fileName = `Family_Database_Complete_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return {
      success: true,
      message: `Complete family database exported successfully! Total: ${stats.totalFamilies} families, ${stats.totalFamilyHeads + stats.totalSpouses + stats.totalChildren + stats.totalGrandchildren} total members`,
      stats
    };

  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export family data');
  }
};

function calculateFamilyStats(
  familyHeads: any[],
  spouses: any[],
  children: any[],
  childSpouses: any[],
  grandchildren: any[]
): FamilyStats {
  const sons = children.filter(child => child.child_type === 'sons');
  const daughters = children.filter(child => child.child_type === 'daughters');
  const marriedChildren = children.filter(child => child.marital_status === 'married');

  // Occupation breakdown
  const occupationBreakdown: Record<string, number> = {};
  const allPeople = [...familyHeads, ...spouses, ...children, ...childSpouses, ...grandchildren];
  
  allPeople.forEach(person => {
    if (person.occupation) {
      occupationBreakdown[person.occupation] = (occupationBreakdown[person.occupation] || 0) + 1;
    }
  });

  // Age group breakdown
  const ageGroups: Record<string, number> = {
    '0-18': 0,
    '19-35': 0,
    '36-50': 0,
    '51-65': 0,
    '65+': 0,
    'Unknown': 0
  };

  allPeople.forEach(person => {
    const age = person.age;
    if (age === null || age === undefined) {
      ageGroups['Unknown']++;
    } else if (age <= 18) {
      ageGroups['0-18']++;
    } else if (age <= 35) {
      ageGroups['19-35']++;
    } else if (age <= 50) {
      ageGroups['36-50']++;
    } else if (age <= 65) {
      ageGroups['51-65']++;
    } else {
      ageGroups['65+']++;
    }
  });

  return {
    totalFamilies: familyHeads.length,
    totalFamilyHeads: familyHeads.length,
    totalSpouses: spouses.length,
    totalSons: sons.length,
    totalDaughters: daughters.length,
    totalChildren: children.length,
    totalGrandchildren: grandchildren.length,
    marriedChildren: marriedChildren.length,
    occupationBreakdown,
    ageGroups
  };
}
