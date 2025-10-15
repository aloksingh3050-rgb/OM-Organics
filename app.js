// Dairy products data
const dairyProducts = [
    { name: "Cow Milk", unit: "Liters", hsnCode: "0401", gstRate: "0%" },
    { name: "Buffalo Milk", unit: "Liters", hsnCode: "0401", gstRate: "0%" },
    { name: "Dahi (Curd)", unit: "Kg", hsnCode: "0403", gstRate: "5%" },
    { name: "Cow Ghee", unit: "Kg", hsnCode: "0405", gstRate: "12%" },
    { name: "Buffalo Ghee", unit: "Kg", hsnCode: "0405", gstRate: "12%" },
    { name: "Paneer", unit: "Kg", hsnCode: "0406", gstRate: "5%" },
    { name: "Butter", unit: "Kg", hsnCode: "0405", gstRate: "12%" },
    { name: "Buttermilk", unit: "Liters", hsnCode: "0403", gstRate: "5%" },
    { name: "Khoa/Mawa", unit: "Kg", hsnCode: "0402", gstRate: "5%" },
    { name: "Fresh Cream", unit: "Kg", hsnCode: "0401", gstRate: "5%" },
    { name: "Milk Powder", unit: "Kg", hsnCode: "0402", gstRate: "5%" },
    { name: "Cheese Cubes", unit: "Kg", hsnCode: "0406", gstRate: "12%" },
    { name: "Lassi", unit: "Liters", hsnCode: "0403", gstRate: "5%" },
    { name: "Flavored Milk", unit: "Liters", hsnCode: "0401", gstRate: "12%" }
];

const units = ["Liters", "Kg", "Pieces", "Packets", "Boxes"];
const gstRates = ["0%", "5%", "12%", "18%", "28%"];

// State management
let invoiceData = {
    customer: {},
    products: [],
    gstEnabled: false,
    dueEnabled: false,
    amountPaid: 0,
    company: {
        name: "HM Organics",
        address: "D-003 Sai inclave Tilpta, Greater Noida (U.P)",
        tagline: "Quality Dairy Products",
        gstin: "",
        logo: null
    },
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    addProductRow(); // Add initial product row
});

function initializeApp() {
    // Set today's date as default
    document.getElementById('invoiceDate').value = invoiceData.invoiceDate;
    
    // Update invoice number display
    updateInvoiceTitle();
}

function setupEventListeners() {
    // Logo upload
    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
    
    // Customer name change (auto-rename invoice)
    document.getElementById('customerName').addEventListener('input', function(e) {
        invoiceData.customer.name = e.target.value;
        updateInvoiceTitle();
    });
    
    // GST toggle
    document.getElementById('gstToggle').addEventListener('change', function(e) {
        invoiceData.gstEnabled = e.target.checked;
        toggleGSTSection();
        calculateTotals();
    });
    
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', addProductRow);
    
    // Digital action buttons
    document.getElementById('previewBtn').addEventListener('click', showInvoicePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadInvoicePDF);
    document.getElementById('whatsappBtn').addEventListener('click', sendViaWhatsApp);
    document.getElementById('emailBtn').addEventListener('click', emailInvoice);
    
    // Modal action buttons
    document.getElementById('closePreview').addEventListener('click', closePreviewModal);
    document.getElementById('closePreview2').addEventListener('click', closePreviewModal);
    document.getElementById('downloadFromPreview').addEventListener('click', downloadInvoicePDF);
    document.getElementById('shareFromPreview').addEventListener('click', sendViaWhatsApp);
    
    // Close modal on backdrop click
    document.getElementById('previewModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closePreviewModal();
        }
    });
    
    // Form inputs for customer data
    ['customerPhone', 'customerAddress', 'customerGSTIN', 'invoiceDate', 'companyGSTIN', 'placeOfSupply'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateInvoiceData);
        }
    });
}

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HMO-${year}${month}${day}-${random}`;
}

function updateInvoiceTitle() {
    const customerName = invoiceData.customer.name || '';
    const title = customerName ? `Invoice for ${customerName}` : 'HM Organics - Invoice Generator';
    document.title = title;
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.innerHTML = `<img src="${e.target.result}" alt="Company Logo">`;
            invoiceData.company.logo = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function toggleGSTSection() {
    const gstSection = document.getElementById('gstSection');
    const cgstRow = document.getElementById('cgstRow');
    const sgstRow = document.getElementById('sgstRow');
    const igstRow = document.getElementById('igstRow');
    
    if (invoiceData.gstEnabled) {
        gstSection.style.display = 'block';
        cgstRow.style.display = 'flex';
        sgstRow.style.display = 'flex';
        // IGST is shown for inter-state transactions
    } else {
        gstSection.style.display = 'none';
        cgstRow.style.display = 'none';
        sgstRow.style.display = 'none';
        igstRow.style.display = 'none';
    }
}

function addProductRow() {
    const productRows = document.getElementById('productRows');
    const rowIndex = invoiceData.products.length;
    
    // Add empty product to data
    invoiceData.products.push({
        name: '',
        quantity: 0,
        unit: 'Kg',
        rate: 0,
        amount: 0,
        hsnCode: '',
        gstRate: '5%'
    });
    
    const row = document.createElement('div');
    row.className = 'product-row';
    row.innerHTML = `
        <select class="form-control product-select" data-index="${rowIndex}">
            <option value="">Select Product</option>
            ${dairyProducts.map(product => 
                `<option value="${product.name}" data-unit="${product.unit}" data-hsn="${product.hsnCode}" data-gst="${product.gstRate}">
                    ${product.name}
                </option>`
            ).join('')}
        </select>
        <input type="number" class="form-control quantity-input" placeholder="Qty" min="0" step="0.01" data-index="${rowIndex}">
        <select class="form-control unit-select" data-index="${rowIndex}">
            ${units.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
        </select>
        <input type="number" class="form-control rate-input" placeholder="Rate" min="0" step="0.01" data-index="${rowIndex}">
        <input type="number" class="form-control amount-input" placeholder="Amount" readonly data-index="${rowIndex}">
        <button type="button" class="remove-product" data-index="${rowIndex}" title="Remove Product">
            ×
        </button>
    `;
    
    productRows.appendChild(row);
    
    // Setup event listeners for this row
    setupProductRowListeners(row, rowIndex);
}

function setupProductRowListeners(row, index) {
    const productSelect = row.querySelector('.product-select');
    const quantityInput = row.querySelector('.quantity-input');
    const unitSelect = row.querySelector('.unit-select');
    const rateInput = row.querySelector('.rate-input');
    const removeBtn = row.querySelector('.remove-product');
    
    productSelect.addEventListener('change', function() {
        const selectedOption = this.selectedOptions[0];
        if (selectedOption.value) {
            const unit = selectedOption.dataset.unit;
            const hsnCode = selectedOption.dataset.hsn;
            const gstRate = selectedOption.dataset.gst;
            
            unitSelect.value = unit;
            invoiceData.products[index].name = selectedOption.value;
            invoiceData.products[index].unit = unit;
            invoiceData.products[index].hsnCode = hsnCode;
            invoiceData.products[index].gstRate = gstRate;
        }
        updateProductAmount(index);
    });
    
    quantityInput.addEventListener('input', function() {
        invoiceData.products[index].quantity = parseFloat(this.value) || 0;
        updateProductAmount(index);
    });
    
    unitSelect.addEventListener('change', function() {
        invoiceData.products[index].unit = this.value;
    });
    
    rateInput.addEventListener('input', function() {
        invoiceData.products[index].rate = parseFloat(this.value) || 0;
        updateProductAmount(index);
    });
    
    removeBtn.addEventListener('click', function() {
        removeProductRow(index);
    });
}

function updateProductAmount(index) {
    const product = invoiceData.products[index];
    const amount = product.quantity * product.rate;
    product.amount = amount;
    
    const row = document.querySelector(`[data-index="${index}"] .amount-input, .amount-input[data-index="${index}"]`);
    if (row) {
        row.value = amount.toFixed(2);
    }
    
    calculateTotals();
}

function removeProductRow(index) {
    // Remove from UI
    const rows = document.querySelectorAll('.product-row');
    if (rows[index]) {
        rows[index].remove();
    }
    
    // Remove from data
    invoiceData.products.splice(index, 1);
    
    // Re-render all rows with updated indices
    rerenderProductRows();
    
    calculateTotals();
}

function rerenderProductRows() {
    const productRows = document.getElementById('productRows');
    productRows.innerHTML = '';
    
    const tempProducts = [...invoiceData.products];
    invoiceData.products = [];
    
    tempProducts.forEach((product, index) => {
        addProductRow();
        
        // Restore data
        invoiceData.products[index] = { ...product };
        
        // Restore UI values
        const row = productRows.children[index];
        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity-input');
        const unitSelect = row.querySelector('.unit-select');
        const rateInput = row.querySelector('.rate-input');
        const amountInput = row.querySelector('.amount-input');
        
        productSelect.value = product.name;
        quantityInput.value = product.quantity;
        unitSelect.value = product.unit;
        rateInput.value = product.rate;
        amountInput.value = product.amount.toFixed(2);
    });
}

function calculateTotals() {
    const subtotal = invoiceData.products.reduce((sum, product) => sum + product.amount, 0);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let totalTax = 0;

    if (invoiceData.gstEnabled) {
        // Calculate GST for each product
        invoiceData.products.forEach(product => {
            if (product.gstRate && product.gstRate !== '0%') {
                const gstPercentage = parseFloat(product.gstRate.replace('%', '')) / 100;
                const productTax = product.amount * gstPercentage;
                // For intra-state: CGST + SGST (half each), else IGST
                const isInterState = false;

                if (isInterState) {
                    igstAmount += productTax;
                } else {
                    cgstAmount += productTax / 2;
                    sgstAmount += productTax / 2;
                }

                totalTax += productTax;
            }
        });
    }

    const total = subtotal + totalTax;

    // Due calculations
    let dueAmount = null;
    if (invoiceData.dueEnabled) {
        invoiceData.amountPaid = Math.max(0, Number(document.getElementById('amountPaidInput').value));
        dueAmount = total - invoiceData.amountPaid;
        dueAmount = dueAmount < 0 ? 0 : dueAmount;
        document.getElementById('dueAmountValue').textContent = `₹${dueAmount.toFixed(2)}`;
    }

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cgstAmount').textContent = `₹${cgstAmount.toFixed(2)}`;
    document.getElementById('sgstAmount').textContent = `₹${sgstAmount.toFixed(2)}`;
    document.getElementById('igstAmount').textContent = `₹${igstAmount.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;

    // Highlight due amount if any due
    const dueRow = document.getElementById('dueAmountRow');
    if (invoiceData.dueEnabled) {
        dueRow.classList.remove('hidden');
        if (dueAmount > 0.01) {
            dueRow.classList.add('status--error');
        } else {
            dueRow.classList.remove('status--error');
        }
    }

    // Store in invoice data
    invoiceData.totals = {
        subtotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalTax,
        total,
        dueAmount: invoiceData.dueEnabled ? dueAmount : null,
        amountPaid: invoiceData.dueEnabled ? invoiceData.amountPaid : null
    };
}

function updateInvoiceData() {
    // Update customer data
    invoiceData.customer = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        gstin: document.getElementById('customerGSTIN').value
    };
    
    // Update invoice details
    invoiceData.invoiceDate = document.getElementById('invoiceDate').value;
    invoiceData.company.gstin = document.getElementById('companyGSTIN').value;
    invoiceData.placeOfSupply = document.getElementById('placeOfSupply').value;
}

function showInvoicePreview() {
    updateInvoiceData();
    
    if (!validateInvoiceData()) {
        return;
    }
    
    const preview = generateInvoiceHTML(false);
    document.getElementById('invoicePreview').innerHTML = preview;
    document.getElementById('previewModal').classList.add('active');
}

function validateInvoiceData() {
    if (!invoiceData.customer.name) {
        alert('Please enter customer name');
        document.getElementById('customerName').focus();
        return false;
    }
    
    if (invoiceData.products.length === 0 || !invoiceData.products.some(p => p.name)) {
        alert('Please add at least one product');
        return false;
    }
    
    return true;
}

function generateInvoiceHTML(isPrint = false) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN');
    };

    const logoSection = invoiceData.company.logo
        ? `<img src="${invoiceData.company.logo}" alt="Company Logo" style="max-width: 100px; max-height: 100px;">`
        : '';
    const companyName = isPrint ? 'HM Organics' : 'HM Organics - Digital Invoice Generator';
    const companyTagline = invoiceData.company.tagline || 'Quality Dairy Products';

    return `
        <div class="invoice-header">
            <div>
                ${logoSection}
                <h1>${isPrint ? 'HM Organics' : 'HM Organics - Digital Invoice Generator'}</h1>
                ${isPrint ? `<p>${companyTagline}</p>` : ''}
                <p>${invoiceData.company.address}</p>
                ${invoiceData.company.gstin ? `<p><strong>GSTIN:</strong> ${invoiceData.company.gstin}</p>` : ''}
            </div>
            <div>
                <h2>INVOICE</h2>
                <p><strong>Invoice No:</strong> ${invoiceData.invoiceNumber}</p>
                <p><strong>Date:</strong> ${formatDate(invoiceData.invoiceDate)}</p>
            </div>
        </div>

        <div class="invoice-details">
            <h3>Bill To:</h3>
            <p><strong>${invoiceData.customer.name}</strong></p>
            ${invoiceData.customer.address ? `<p>${invoiceData.customer.address}</p>` : ''}
            ${invoiceData.customer.phone ? `<p><strong>Phone:</strong> ${invoiceData.customer.phone}</p>` : ''}
            ${invoiceData.customer.gstin ? `<p><strong>GSTIN:</strong> ${invoiceData.customer.gstin}</p>` : ''}
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>HSN Code</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Rate</th>
                    ${invoiceData.gstEnabled ? '<th>GST Rate</th>' : ''}
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.products.filter(p => p.name).map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.hsnCode || '-'}</td>
                        <td>${product.quantity}</td>
                        <td>${product.unit}</td>
                        <td>₹${product.rate.toFixed(2)}</td>
                        ${invoiceData.gstEnabled ? `<td>${product.gstRate}</td>` : ''}
                        <td>₹${product.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="invoice-summary">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹${invoiceData.totals.subtotal.toFixed(2)}</span>
            </div>
            ${invoiceData.gstEnabled && invoiceData.totals.cgstAmount > 0 ? `
                <div class="summary-row">
                    <span>CGST:</span>
                    <span>₹${invoiceData.totals.cgstAmount.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>SGST:</span>
                    <span>₹${invoiceData.totals.sgstAmount.toFixed(2)}</span>
                </div>
            ` : ''}
            ${invoiceData.gstEnabled && invoiceData.totals.igstAmount > 0 ? `
                <div class="summary-row">
                    <span>IGST:</span>
                    <span>₹${invoiceData.totals.igstAmount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="summary-row total-row">
                <span>Total Amount:</span>
                <span>₹${invoiceData.totals.total.toFixed(2)}</span>
            </div>
            ${invoiceData.dueEnabled ? `
                <div class="summary-row">
                    <span>Paid:</span>
                    <span>₹${(invoiceData.totals.amountPaid || 0).toFixed(2)}</span>
                </div>
                <div class="summary-row" style="color:#C0152F;font-weight:bold;">
                    <span>Due Amount:</span>
                    <span>₹${(invoiceData.totals.dueAmount || 0).toFixed(2)}</span>
                </div>
            ` : ''}
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p><strong>Terms &amp; Conditions:</strong></p>
            <ul>
                <li>Payment terms as agreed</li>
                <li>Quality assurance guaranteed</li>
                <li>For any queries, contact us at the above address</li>
            </ul>
        </div>
        ${!isPrint ? `
        <div style="margin-top: 40px; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <p><strong>💚 Digitally Generated Invoice</strong></p>
            <p style="color: #4CAF50; font-weight: bold;">For ${invoiceData.company.name}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">🌱 Eco-friendly Digital Invoice • No signature required</p>
        </div>` : ''}
    `;
}

function closePreviewModal() {
    document.getElementById('previewModal').classList.remove('active');
}

function downloadInvoicePDF() {
    updateInvoiceData();

    if (!validateInvoiceData()) {
        return;
    }

    // Generate invoice HTML for PDF
    const invoiceHTML = generateInvoiceHTML(true);

    // Create a new window for PDF generation
    const pdfWindow = window.open('', '_blank');
    pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice-${invoiceData.invoiceNumber}-${invoiceData.customer.name.replace(/[^a-zA-Z0-9]/g, '')}</title>
            <style>
                @media print {
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    body {
                        margin: 5%% !important;
                    }
                    .no-print { display: none !important; }
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .invoice-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #4CAF50;
                }
                .invoice-table {
                    width: 100%%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .invoice-table th,
                .invoice-table td {
                    padding: 8px 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                .invoice-table th {
                    background: #f5f5f5;
                    font-weight: bold;
                }
                .invoice-summary {
                    margin-left: auto;
                    width: 300px;
                    margin-top: 20px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                }
                .total-row {
                    border-top: 2px solid #333;
                    font-weight: bold;
                    font-size: 18px;
                    padding-top: 8px;
                    margin-top: 8px;
                }
                h1 { color: #4CAF50; }
                h2 { color: #333; }
            </style>
        </head>
        <body>
            ${invoiceHTML}
            <script>
                setTimeout(() => window.print(), 500);
            </script>
        </body>
        </html>
    `);
    pdfWindow.document.close();
}

function sendViaWhatsApp() {
    updateInvoiceData();

    if (!validateInvoiceData()) {
        return;
    }

    // WhatsApp message formatting
    let message = `Invoice: ${invoiceData.invoiceNumber} | Customer: ${invoiceData.customer.name} | Total: ₹${invoiceData.totals.total.toFixed(2)}`;
    if (invoiceData.dueEnabled) {
        message += ` | Paid: ₹${(invoiceData.totals.amountPaid || 0).toFixed(2)} | Due: ₹${(invoiceData.totals.dueAmount || 0).toFixed(2)}`;
    }
    message += "\n";

    message += `\n*INVOICE FROM HM ORGANICS*\n`;
    message += `Invoice No: ${invoiceData.invoiceNumber}\n`;
    message += `Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}\n`;
    message += `Customer: ${invoiceData.customer.name}`;
    if (invoiceData.customer.phone) message += `, Phone: ${invoiceData.customer.phone}`;
    if (invoiceData.customer.address) message += `, Address: ${invoiceData.customer.address}`;
    message += `\n\n`;

    message += `Products:\n`;
    invoiceData.products.filter(p => p.name).forEach((product, index) => {
        message += `${index + 1}. ${product.name}, Qty: ${product.quantity} ${product.unit}, Rate: ₹${product.rate.toFixed(2)}, Amount: ₹${product.amount.toFixed(2)}\n`;
    });

    message += `\nTotal Amount: ₹${invoiceData.totals.total.toFixed(2)}`;

    if (invoiceData.dueEnabled) {
        message += `\nPaid: ₹${(invoiceData.totals.amountPaid || 0).toFixed(2)}`;
        message += `\nDue: ₹${(invoiceData.totals.dueAmount || 0).toFixed(2)}`;
        if (invoiceData.totals.dueAmount > 0.01) {
            message += `\n(Note: Please clear due amount at earliest)`;
        }
    }

    message += `\n\nFor any queries, contact us at: ${invoiceData.company.address}`;
    message += `\n\nQuality Dairy Products by HM Organics`;
    message += `\nThank you!`;

    // Encode for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

function emailInvoice() {
    updateInvoiceData();
    
    if (!validateInvoiceData()) {
        return;
    }
    
    // Create email content
    const subject = `Invoice ${invoiceData.invoiceNumber} from HM Organics`;
    
    let emailBody = `Dear ${invoiceData.customer.name},\n\n`;
    emailBody += `Thank you for your order! Please find your invoice details below:\n\n`;
    emailBody += `Invoice Number: ${invoiceData.invoiceNumber}\n`;
    emailBody += `Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}\n\n`;
    
    emailBody += `Products Ordered:\n`;
    invoiceData.products.filter(p => p.name).forEach((product, index) => {
        emailBody += `${index + 1}. ${product.name} - ${product.quantity} ${product.unit} @ ₹${product.rate.toFixed(2)} = ₹${product.amount.toFixed(2)}\n`;
    });
    
    emailBody += `\nTotal Amount: ₹${invoiceData.totals.total.toFixed(2)}\n`;
    
    if (invoiceData.dueEnabled) {
        emailBody += `Amount Paid: ₹${(invoiceData.totals.amountPaid || 0).toFixed(2)}\n`;
        emailBody += `Due Amount: ₹${(invoiceData.totals.dueAmount || 0).toFixed(2)}\n`;
        if (invoiceData.totals.dueAmount > 0.01) {
            emailBody += `\nPlease clear the due amount at your earliest convenience.\n`;
        }
    }
    
    emailBody += `\nHM Organics\n`;
    emailBody += `${invoiceData.company.address}\n\n`;
    
    emailBody += `Thank you for choosing HM Organics!\n`;
    emailBody += `Quality Dairy Products\n`;
    emailBody += `For any queries, contact us at the above address\n\n`;
    
    emailBody += `Best regards,\nHM Organics Team`;
    
    // Create mailto link
    const mailtoLink = `mailto:${invoiceData.customer.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
    
    // Show success message
    alert('Email client opened! Please send the invoice to your customer.');
}