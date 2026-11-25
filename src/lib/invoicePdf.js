import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function fmtRs(amount) {
  return `Rs. ${Number(amount || 0).toFixed(2)}`;
}

function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export function downloadInvoicePdf({
  invoice_number,
  invoice_generated_at,
  order,
  settings
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const storeName = settings?.store_name || 'Kushi Dairy Products';
  const storePhone = settings?.phone || '8464952708';
  const items = order?.order_items || [];

  // Header band
  doc.setFillColor(9, 37, 84); // --navy-deep (#092554)
  doc.rect(0, 0, 595.28, 92, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Kushi Farm', 40, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(storeName, 40, 54);
  doc.text(
    `Chaparam Village, Patrunivalasa Post, Srikakulam, AP | +91 ${storePhone}`,
    40,
    70
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('INVOICE', 555, 40, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice_number}`, 555, 56, { align: 'right' });
  doc.text(`Order Ref: ${order.order_ref}`, 555, 70, { align: 'right' });

  // Customer & Date Metadata
  doc.setTextColor(10, 37, 75);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Billed To:', 40, 122);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const addr = order.address || {};
  const addressLine = [addr.street, addr.landmark, addr.pincode]
    .filter(Boolean)
    .join(', ');

  doc.text(order.customer_name || '-', 40, 138);
  doc.text(`Phone: +91 ${order.phone || '-'}`, 40, 153);
  doc.text(addressLine || '-', 40, 168, { maxWidth: 270 });

  doc.setFont('helvetica', 'bold');
  doc.text('Order Date:', 370, 122);
  doc.text('Invoice Date:', 370, 138);
  doc.text('Payment Status:', 370, 154);

  doc.setFont('helvetica', 'normal');
  doc.text(fmtDate(order.created_at), 555, 122, { align: 'right' });
  doc.text(fmtDate(invoice_generated_at || new Date().toISOString()), 555, 138, {
    align: 'right'
  });
  doc.text(
    `${String(order.payment_status || 'pending').toUpperCase()} (${String(
      order.payment_method || 'razorpay'
    ).toUpperCase()})`,
    555,
    154,
    { align: 'right' }
  );

  // Items Table
  autoTable(doc, {
    startY: 202,
    head: [['#', 'Product', 'Pack Size', 'Qty', 'Unit Price', 'Line Total']],
    body: items.map((item, idx) => [
      String(idx + 1),
      item.product_name,
      item.variant_label,
      String(item.qty),
      fmtRs(item.unit_price),
      fmtRs(item.line_total)
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [18, 86, 168],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5
    },
    styles: {
      fontSize: 9.5,
      cellPadding: 8,
      textColor: [10, 37, 75]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 42 },
      4: { halign: 'right', cellWidth: 85 },
      5: { halign: 'right', cellWidth: 90 }
    }
  });

  // Totals block (Plain invoice, no GST lines for v1)
  const finalY = (doc.lastAutoTable?.finalY || 260) + 22;
  const deliveryFee = Number(order.delivery_fee || 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text('Subtotal:', 420, finalY);
  doc.text(fmtRs(order.subtotal), 555, finalY, { align: 'right' });

  doc.text('Delivery Fee:', 420, finalY + 18);
  doc.text(deliveryFee === 0 ? 'FREE' : fmtRs(deliveryFee), 555, finalY + 18, {
    align: 'right'
  });

  doc.setDrawColor(203, 216, 230);
  doc.line(380, finalY + 28, 555, finalY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Grand Total:', 420, finalY + 46);
  doc.text(fmtRs(order.total), 555, finalY + 46, { align: 'right' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(123, 143, 168);
  doc.text(
    'Thank you for choosing Kushi Dairy Products — Simple Goodness. Every Day.',
    297.64,
    790,
    { align: 'center' }
  );
  doc.text('kushifarm.com · Chaparam, Srikakulam', 297.64, 804, {
    align: 'center'
  });

  doc.save(`Kushi_Invoice_${invoice_number}.pdf`);
}
