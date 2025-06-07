
import { supabase } from '@/integrations/supabase/client';

export const downloadFormData = async () => {
  try {
    // Fetch all data from Supabase
    const { data: familyHeads, error: familyHeadsError } = await supabase
      .from('family_heads')
      .select('*');
    
    if (familyHeadsError) throw familyHeadsError;

    const { data: spouses, error: spousesError } = await supabase
      .from('spouses')
      .select('*');
    
    if (spousesError) throw spousesError;

    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('*');
    
    if (childrenError) throw childrenError;

    // Create CSV content
    let csvContent = '';
    
    // Family Heads CSV
    csvContent += 'FAMILY HEADS\n';
    csvContent += 'ID,First Name,Last Name,Date of Birth,Age,Native Place,Current Place,Contact Number,Marital Status,Occupation,Created At\n';
    
    familyHeads?.forEach(head => {
      csvContent += `"${head.id}","${head.first_name || ''}","${head.last_name || ''}","${head.date_of_birth || ''}","${head.age || ''}","${head.native_place || ''}","${head.current_place || ''}","${head.contact_number || ''}","${head.marital_status || ''}","${head.occupation || ''}","${head.created_at}"\n`;
    });

    csvContent += '\n\nSPOUSES\n';
    csvContent += 'ID,Family Head ID,First Name,Last Name,Date of Birth,Age,Native Place,Contact Number,Occupation,Number of Sons,Number of Daughters,Created At\n';
    
    spouses?.forEach(spouse => {
      csvContent += `"${spouse.id}","${spouse.family_head_id}","${spouse.first_name || ''}","${spouse.last_name || ''}","${spouse.date_of_birth || ''}","${spouse.age || ''}","${spouse.native_place || ''}","${spouse.contact_number || ''}","${spouse.occupation || ''}","${spouse.number_of_sons || 0}","${spouse.number_of_daughters || 0}","${spouse.created_at}"\n`;
    });

    csvContent += '\n\nCHILDREN\n';
    csvContent += 'ID,Family Head ID,First Name,Last Name,Date of Birth,Age,Contact Number,Current Place,Phone Number,Occupation,Marital Status,Child Type,Child Index,Created At\n';
    
    children?.forEach(child => {
      csvContent += `"${child.id}","${child.family_head_id}","${child.first_name || ''}","${child.last_name || ''}","${child.date_of_birth || ''}","${child.age || ''}","${child.contact_number || ''}","${child.current_place || ''}","${child.phone_number || ''}","${child.occupation || ''}","${child.marital_status || ''}","${child.child_type || ''}","${child.child_index || ''}","${child.created_at}"\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `family_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};
